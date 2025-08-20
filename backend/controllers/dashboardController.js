const { SalesPerformance } = require('../models');
const { Op } = require('sequelize');
const { parseSalesData } = require('../services/excelParser');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');

const uploadSalesData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "File Excel tidak ditemukan" });
    }

    const filePath = req.file.path;
    const salesData = parseSalesData(filePath);
    
    // Hapus data lama sebelum mengunggah yang baru
    await SalesPerformance.destroy({ truncate: true, cascade: true });
    
    // Ambil semua newOrderId yang sudah ada di database
    const existingOrders = await SalesPerformance.findAll({
      attributes: ['newOrderId'],
      raw: true,
      paranoid: false
    });
    const existingOrderIds = new Set(existingOrders.map(o => o.newOrderId));

    // Filter data baru untuk menghindari duplikasi
    const uniqueSalesData = salesData.filter(d => !existingOrderIds.has(d.newOrderId));

    if (uniqueSalesData.length > 0) {
      await SalesPerformance.bulkCreate(uniqueSalesData);
    }
    
    fs.unlinkSync(filePath);

    res.status(200).json({ msg: `Berhasil mengunggah ${uniqueSalesData.length} data baru.`, totalSkipped: salesData.length - uniqueSalesData.length });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
};

const getSalesforceCategory = (psCount) => {
  if (psCount >= 0 && psCount <= 1) return 'Black';
  if (psCount >= 2 && psCount <= 5) return 'Bronze';
  if (psCount >= 6 && psCount <= 10) return 'Silver';
  if (psCount >= 11 && psCount <= 20) return 'Gold';
  if (psCount >= 21 && psCount <= 50) return 'Platinum';
  return 'Diamond';
};

// --- Perbaikan di Sini: Menghitung metrik per sales ---
const getMetrics = async (req, res) => {
  try {
    const allSalesData = await SalesPerformance.findAll({ raw: true });

    // Mengelompokkan data berdasarkan kodeSF
    const salesDataByCode = allSalesData.reduce((acc, sale) => {
      if (!acc[sale.kodeSF]) {
        acc[sale.kodeSF] = [];
      }
      acc[sale.kodeSF].push(sale);
      return acc;
    }, {});

    const metricsPerSales = Object.entries(salesDataByCode).map(([kodeSF, data]) => {
      // Perbaikan: Pastikan tanggal diurutkan
      data.sort((a, b) => new Date(a.tanggalPS) - new Date(b.tanggalPS));

      return {
        kodeSF: kodeSF,
        WoW: getWeeklyChange(data),
        MoM: getMonthlyChange(data),
        QoQ: getQuarterlyChange(data),
        YoY: getYearlyChange(data),
      };
    });

    res.json(metricsPerSales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWeeklyChange = (data) => {
  const today = new Date();
  const psLastWeek = data.filter(d => d.tanggalPS > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) && d.tanggalPS <= today).length;
  const psTwoWeeksAgo = data.filter(d => d.tanggalPS > new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000) && d.tanggalPS <= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
  if (psTwoWeeksAgo === 0) return psLastWeek > 0 ? 'N/A' : '0.00';
  return (((psLastWeek - psTwoWeeksAgo) / psTwoWeeksAgo) * 100).toFixed(2);
};

const getMonthlyChange = (data) => {
  const today = new Date();
  const psThisMonth = data.filter(d => d.tanggalPS.getMonth() === today.getMonth() && d.tanggalPS.getFullYear() === today.getFullYear()).length;
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  const psLastMonth = data.filter(d => d.tanggalPS.getMonth() === lastMonth.getMonth() && d.tanggalPS.getFullYear() === lastMonth.getFullYear()).length;
  if (psLastMonth === 0) return psThisMonth > 0 ? 'N/A' : '0.00';
  return (((psThisMonth - psLastMonth) / psLastMonth) * 100).toFixed(2);
};

const getQuarterlyChange = (data) => {
  const today = new Date();
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const psThisQuarter = data.filter(d => Math.floor(d.tanggalPS.getMonth() / 3) === currentQuarter && d.tanggalPS.getFullYear() === today.getFullYear()).length;
  const lastQuarter = new Date(today);
  lastQuarter.setMonth(today.getMonth() - 3);
  const prevQuarter = Math.floor(lastQuarter.getMonth() / 3);
  const psPrevQuarter = data.filter(d => Math.floor(d.tanggalPS.getMonth() / 3) === prevQuarter && d.tanggalPS.getFullYear() === lastQuarter.getFullYear()).length;
  if (psPrevQuarter === 0) return psThisQuarter > 0 ? 'N/A' : '0.00';
  return (((psThisQuarter - psPrevQuarter) / psPrevQuarter) * 100).toFixed(2);
};

const getYearlyChange = (data) => {
  const today = new Date();
  const psThisYear = data.filter(d => d.tanggalPS.getFullYear() === today.getFullYear()).length;
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  const psLastYear = data.filter(d => d.tanggalPS.getFullYear() === lastYear.getFullYear()).length;
  if (psLastYear === 0) return psThisYear > 0 ? 'N/A' : '0.00';
  return (((psThisYear - psLastYear) / psLastYear) * 100).toFixed(2);
};

const getOverallPerformance = async (req, res) => {
  try {
    const psData = await SalesPerformance.findAll({
      attributes: ['kodeSF', 'namaSF',
        [sequelize.fn('COUNT', sequelize.col('kodeSF')), 'totalPs']
      ],
      group: ['kodeSF', 'namaSF']
    });

    const formattedData = psData.map(item => {
      const psCount = item.get('totalPs');
      return {
        kodeSF: item.kodeSF,
        namaSF: item.namaSF,
        totalPs: psCount,
        category: getSalesforceCategory(psCount),
      };
    });

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadSalesData, getOverallPerformance, getMetrics };
