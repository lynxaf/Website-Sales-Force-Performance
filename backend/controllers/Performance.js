import Product from "../models/PerformanceModel.js";
import User from "../models/UserModel.js";
import {Op} from "sequelize";
import fs from "fs";
import xlsx from "xlsx";

export const getPerformance = async (req, res) =>{
    try {
        let response;
        if(req.role === "admin"){
            response = await Product.findAll({
                attributes:['uuid','name','price'],
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }else{
            response = await Product.findAll({
                attributes:['uuid','name','price'],
                where:{
                    userId: req.userId
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getPerformanceById = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        let response;
        if(req.role === "admin"){
            response = await Product.findOne({
                attributes:['uuid','name','price'],
                where:{
                    id: product.id
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }else{
            response = await Product.findOne({
                attributes:['uuid','name','price'],
                where:{
                    [Op.and]:[{id: product.id}, {userId: req.userId}]
                },
                include:[{
                    model: User,
                    attributes:['name','email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createPerformance = async(req, res) =>{
    const {name, price} = req.body;
    try {
        await Product.create({
            name: name,
            price: price,
            userId: req.userId
        });
        res.status(201).json({msg: "Product Created Successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const updatePerformance = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        const {name, price} = req.body;
        if(req.role === "admin"){
            await Product.update({name, price},{
                where:{
                    id: product.id
                }
            });
        }else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses terlarang"});
            await Product.update({name, price},{
                where:{
                    [Op.and]:[{id: product.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Product updated successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const deletePerformance = async(req, res) =>{
    try {
        const product = await Product.findOne({
            where:{
                uuid: req.params.id
            }
        });
        if(!product) return res.status(404).json({msg: "Data tidak ditemukan"});
        const {name, price} = req.body;
        if(req.role === "admin"){
            await Product.destroy({
                where:{
                    id: product.id
                }
            });
        }else{
            if(req.userId !== product.userId) return res.status(403).json({msg: "Akses terlarang"});
            await Product.destroy({
                where:{
                    [Op.and]:[{id: product.id}, {userId: req.userId}]
                }
            });
        }
        res.status(200).json({msg: "Product deleted successfuly"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

//upload file excel
export const uploadSalesPerformance = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "File Excel tidak ditemukan" });
        }

        // Baca file excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Validasi kolom
        const requiredColumns = ["Kode SF", "Tanggal PS"];
        const missingColumns = requiredColumns.filter(col => !Object.keys(data[0] || {}).includes(col));
        if (missingColumns.length > 0) {
            return res.status(400).json({ msg: `Kolom wajib hilang: ${missingColumns.join(", ")}` });
        }

        // Hitung jumlah PS per Kode SF
        const salesMap = {};
        data.forEach(row => {
            const kodeSF = row["Kode SF"];
            const tanggalPS = row["Tanggal PS"]; // Bisa dipakai untuk analisis waktu
            if (!kodeSF) return;

            if (!salesMap[kodeSF]) {
                salesMap[kodeSF] = { count: 0, dates: [] };
            }
            salesMap[kodeSF].count += 1;
            salesMap[kodeSF].dates.push(tanggalPS);
        });

        // Mapping kategori
        const result = Object.entries(salesMap).map(([kodeSF, info]) => {
            const psCount = info.count;

            // Kategori SF
            let kategoriSF = "";
            if (psCount <= 1) kategoriSF = "Black";
            else if (psCount <= 5) kategoriSF = "Bronze";
            else if (psCount <= 10) kategoriSF = "Silver";
            else if (psCount <= 20) kategoriSF = "Gold";
            else if (psCount <= 50) kategoriSF = "Platinum";
            else kategoriSF = "Diamond";

            // Produktivitas SF
            let produktivitasSF = "";
            if (psCount === 0) produktivitasSF = "SF Non PS";
            else if (psCount <= 10) produktivitasSF = "SF Aktif";
            else produktivitasSF = "SF Produktif";

            return {
                kode_sf: kodeSF,
                total_ps: psCount,
                kategoriSF,
                produktivitasSF,
                tanggal_penjualan: info.dates
            };
        });

        fs.unlinkSync(req.file.path); // Hapus file setelah diproses

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};