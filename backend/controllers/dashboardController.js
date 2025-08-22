const { Op } = require('sequelize');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('Loading dashboard controller...');

// Try to import your existing models/services with fallbacks
let SalesPerformance, sequelize, parseSalesData;

try {
  // Try your existing structure first
  const models = require('../models');
  SalesPerformance = models.SalesPerformance;
  console.log('✅ SalesPerformance model loaded from ../models');
} catch (error) {
  console.warn('⚠️ Could not load SalesPerformance from ../models:', error.message);
}

try {
  sequelize = require('../config/database');
  console.log('✅ Sequelize loaded from ../config/database');
} catch (error) {
  console.warn('⚠️ Could not load sequelize from ../config/database:', error.message);
  try {
    const models = require('../models');
    sequelize = models.sequelize;
    console.log('✅ Sequelize loaded from ../models');
  } catch (error2) {
    console.warn('⚠️ Could not load sequelize, using mock');
    sequelize = {
      fn: () => 'COUNT',
      col: () => 'kodeSF'
    };
  }
}

try {
  const excelParser = require('../services/excelParser');
  parseSalesData = excelParser.parseSalesData;
  console.log('✅ Excel parser loaded from ../services/excelParser');
} catch (error) {
  console.warn('⚠️ Could not load parseSalesData from ../services/excelParser:', error.message);
  try {
    const utilsParser = require('../utils/parseSalesData');
    parseSalesData = utilsParser.parseSalesData;
    console.log('✅ Excel parser loaded from ../utils/parseSalesData');
  } catch (error2) {
    console.warn('⚠️ Could not load parseSalesData, using basic parser');
    // Basic parser fallback
    parseSalesData = (filePath) => {
      console.log('Using basic Excel parser for:', filePath);
      try {
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        if (data.length < 2) return [];

        const headers = data[0];
        const rows = data.slice(1);

        return rows.map((row, index) => ({
          kodeSF: row[headers.indexOf('Kode SF')] || `SF${index}`,
          namaSF: row[headers.indexOf('Nama SF')] || 'Unknown',
          kodeTL: row[headers.indexOf('Kode TL')] || 'TL001',
          namaTL: row[headers.indexOf('Nama TL')] || 'Unknown TL',
          agency: row[headers.indexOf('Agency')] || 'Unknown Agency',
          area: row[headers.indexOf('Area')] || 'Unknown Area',
          regional: row[headers.indexOf('Regional')] || 'Unknown Regional',
          branch: row[headers.indexOf('Branch')] || 'Unknown Branch',
          wok: row[headers.indexOf('Wilayah Operational Kerja')] || 'Unknown',
          newOrderId: row[headers.indexOf('New Order ID')] || `ORDER${Date.now()}-${index}`,
          tanggalPS: new Date(row[headers.indexOf('Tanggal PS')] || new Date())
        }));
      } catch (parseError) {
        console.error('Basic parser error:', parseError.message);
        return [];
      }
    };
  }
}

const uploadSalesData = async (req, res) => {
  console.log('=== UPLOAD SALES DATA CALLED ===');

  try {
    console.log('Request file:', req.file);

    if (!req.file) {
      console.log('❌ No file found in request');
      return res.status(400).json({
        success: false,
        msg: "File Excel tidak ditemukan"
      });
    }

    const filePath = req.file.path;
    console.log('Processing file:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk:', filePath);
      return res.status(500).json({
        success: false,
        msg: "File tidak ditemukan di server"
      });
    }

    console.log('📊 Parsing sales data...');
    const salesData = parseSalesData(filePath);

    // Ambil semua order ID yang sudah ada di DB
    const existingOrders = await SalesPerformance.findAll({
      attributes: ['newOrderId'],
      raw: true,
      paranoid: false
    });
    const existingOrderIds = new Set(existingOrders.map(o => String(o.newOrderId)));

    // Buat set untuk filter duplicate dalam file upload itu sendiri
    const seenInUpload = new Set();

    // Filter data
    const uniqueSalesData = salesData.filter(d => {
      const orderId = String(d.newOrderId || '').trim();

      if (!orderId) {
        console.log(`⚠️ Skip record karena newOrderId kosong:`, d);
        return false;
      }

      if (existingOrderIds.has(orderId)) {
        console.log(`⚠️ Skip record karena sudah ada di DB: ${orderId}`);
        return false;
      }

      if (seenInUpload.has(orderId)) {
        console.log(`⚠️ Skip record karena duplikat di file upload: ${orderId}`);
        return false;
      }

      seenInUpload.add(orderId);
      return true;
    });

    if (uniqueSalesData.length > 0) {
      console.log(`💾 Inserting ${uniqueSalesData.length} unique records into database...`);
      try {
        await SalesPerformance.bulkCreate(uniqueSalesData);
        console.log('✅ Data inserted successfully');
      } catch (bulkErr) {
        console.error("❌ BulkCreate error:", bulkErr.errors?.map(e => e.message));
        console.error("❌ Failed data sample:", uniqueSalesData[0]);
        throw bulkErr;
      }
    } else {
      console.log("ℹ️ Tidak ada data baru untuk di-insert.");
    }

    // Clean up file
    console.log('🧹 Cleaning up uploaded file...');
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      msg: `Berhasil mengunggah ${uniqueSalesData.length} data baru.`,
      totalSkipped: salesData.length - uniqueSalesData.length,
      data: {
        totalRecords: salesData.length,
        newRecords: uniqueSalesData.length,
        skippedRecords: salesData.length - uniqueSalesData.length
      }
    });

  } catch (error) {
    console.error('❌ Error in uploadSalesData:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Cleaned up file after error');
      } catch (cleanupError) {
        console.warn('Could not clean up file:', cleanupError.message);
      }
    }
    res.status(500).json({
      success: false,
      error: error.message,
      msg: "Terjadi kesalahan saat memproses file"
    });
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

const getWeeklyChange = (data) => {
  const today = new Date();
  const psLastWeek = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) && date <= today;
  }).length;

  const psTwoWeeksAgo = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return date > new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000) &&
      date <= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  if (psTwoWeeksAgo === 0) return psLastWeek > 0 ? 'N/A' : '0.00';
  return (((psLastWeek / psTwoWeeksAgo) - 1) * 100).toFixed(2);
};

const getMonthlyChange = (data) => {
  const today = new Date();
  const psThisMonth = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).length;

  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  const psLastMonth = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  }).length;

  if (psLastMonth === 0) return psThisMonth > 0 ? 'N/A' : '0.00';
  return (((psThisMonth / psLastMonth) - 1) * 100).toFixed(2);
};

const getQuarterlyChange = (data) => {
  const today = new Date();
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const psThisQuarter = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return Math.floor(date.getMonth() / 3) === currentQuarter && date.getFullYear() === today.getFullYear();
  }).length;

  const lastQuarter = new Date(today);
  lastQuarter.setMonth(today.getMonth() - 3);
  const prevQuarter = Math.floor(lastQuarter.getMonth() / 3);
  const psPrevQuarter = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return Math.floor(date.getMonth() / 3) === prevQuarter && date.getFullYear() === lastQuarter.getFullYear();
  }).length;

  if (psPrevQuarter === 0) return psThisQuarter > 0 ? 'N/A' : '0.00';
  return (((psThisQuarter / psPrevQuarter) - 1) * 100).toFixed(2);
};

const getYearlyChange = (data) => {
  const today = new Date();
  const psThisYear = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return date.getFullYear() === today.getFullYear();
  }).length;

  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 1);
  const psLastYear = data.filter(d => {
    const date = new Date(d.tanggalPS);
    return date.getFullYear() === lastYear.getFullYear();
  }).length;

  if (psLastYear === 0) return psThisYear > 0 ? 'N/A' : '0.00';
  return (((psThisYear / psLastYear) - 1) * 100).toFixed(2);
};

const getMetrics = async (req, res) => {
  console.log('getMetrics called');
  try {
    const allSalesData = await SalesPerformance.findAll({ raw: true });
    console.log(`Found ${allSalesData.length} sales records for metrics`);

    // Group data by kodeSF
    const salesDataByCode = allSalesData.reduce((acc, sale) => {
      if (!acc[sale.kodeSF]) {
        acc[sale.kodeSF] = [];
      }
      acc[sale.kodeSF].push(sale);
      return acc;
    }, {});

    const metricsPerSales = Object.entries(salesDataByCode).map(([kodeSF, data]) => {
      data.sort((a, b) => new Date(a.tanggalPS) - new Date(b.tanggalPS));

      return {
        namaSF: data[0].namaSF,  
        kodeSF: kodeSF,
        WoW: getWeeklyChange(data),
        MoM: getMonthlyChange(data),
        QoQ: getQuarterlyChange(data),
        YoY: getYearlyChange(data),
      };
    });

    res.json({
      success: true,
      data: metricsPerSales,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in getMetrics:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

const getOverallPerformance = async (req, res) => {
  console.log('getOverallPerformance called');
  try {
    const psData = await SalesPerformance.findAll({
      // Tambahkan klausa 'where' untuk menyaring data yang tidak valid
      where: {
        kodeSF: {
          [Op.ne]: null
        },
        namaSF: {
          [Op.ne]: null
        }
      },
      attributes: [
        'kodeSF',
        'namaSF',
        'agency',
        'area',
        'regional',
        'branch',
        'wok',
        [sequelize.fn('COUNT', sequelize.col('kodeSF')), 'totalPs']
      ],
      group: [
        'kodeSF',
        'namaSF',
        'agency',
        'area',
        'regional',
        'branch',
        'wok'
      ]
    });

    console.log(`Found ${psData.length} sales force records`);

    const formattedData = psData.map(item => {
      const psCount = item.get('totalPs');
      return {
        kodeSF: item.kodeSF,
        namaSF: item.namaSF,
        totalPs: psCount,
        category: getSalesforceCategory(psCount),
        agency: item.agency,
        area: item.area,
        regional: item.regional,
        branch: item.branch,
        wok: item.wok
      };
    });

    res.json({
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in getOverallPerformance:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

console.log('✅ Dashboard controller loaded successfully');

module.exports = { uploadSalesData, getOverallPerformance, getMetrics };
