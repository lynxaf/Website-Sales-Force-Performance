// const xlsx = require('xlsx');

// const parseSalesData = (filePath) => {
//   const workbook = xlsx.readFile(filePath);
//   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
//   // Menggunakan opsi `header: 1` untuk membaca baris pertama sebagai header
//   const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
//   // Mengambil header (baris pertama) dan data (sisanya)
//   const headers = data[0];
//   const salesData = data.slice(1);

//   // Memetakan data berdasarkan nama kolom
//   const salesRecords = salesData.map(row => {
//     return {
//       namaSF: row[headers.indexOf('Nama SF')],
//       kodeSF: row[headers.indexOf('Kode SF')],
//       namaTL: row[headers.indexOf('Nama TL')],
//       kodeTL: row[headers.indexOf('Kode TL')],
//       agency: row[headers.indexOf('Agency')],
//       area: row[headers.indexOf('Area')],
//       regional: row[headers.indexOf('Regional')],
//       branch: row[headers.indexOf('Branch')],
//       wok: row[headers.indexOf('Wilayah Operational Kerja')],
//       newOrderId: row[headers.indexOf('New Order ID')],
//       tanggalPS: new Date(row[headers.indexOf('Tanggal PS')]),
//     };
//   });
  
//   return salesRecords;
// };

// module.exports = { parseSalesData };
// const xlsx = require('xlsx');

// const parseSalesData = (filePath) => {
//   const workbook = xlsx.readFile(filePath);
//   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
//   // XLSX otomatis baca baris pertama sebagai header
//   const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });

//   // Mapping ke format yang kamu mau
//   const salesRecords = data.map(row => {
//     return {
//       namaSF: row['Nama SF'],
//       kodeSF: row['Kode SF'],
//       namaTL: row['Nama TL'],
//       kodeTL: row['Kode TL'],
//       agency: row['Agency'],
//       area: row['Area'],
//       regional: row['Regional'],
//       branch: row['Branch'],
//       wok: row['Wilayah Operational Kerja'],
//       newOrderId: row['New Order ID'],
//       tanggalPS: row['Tanggal PS'] ? new Date(row['Tanggal PS']) : null,
//     };
//   });

//   return salesRecords;
// };

// module.exports = { parseSalesData };
const xlsx = require('xlsx');

const parseSalesData = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Menggunakan opsi `header: 1` yang mengembalikan data sebagai array of arrays
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Perbaikan: Pastikan file memiliki header (baris pertama)
  if (data.length === 0) {
    return [];
  }

  // Mengambil header (baris pertama) dan data (sisanya)
  const headers = data[0];
  const salesData = data.slice(1);

  // Memetakan data dari array ke objek dengan nama kolom yang benar
  const salesRecords = salesData.map(row => {
    return {
      namaSF: row[headers.indexOf('Nama SF')],
      kodeSF: row[headers.indexOf('Kode SF')],
      namaTL: row[headers.indexOf('Nama TL')],
      kodeTL: row[headers.indexOf('Kode TL')],
      agency: row[headers.indexOf('Agency')],
      area: row[headers.indexOf('Area')],
      regional: row[headers.indexOf('Regional')],
      branch: row[headers.indexOf('Branch')],
      wok: row[headers.indexOf('Wilayah Operational Kerja')],
      newOrderId: row[headers.indexOf('New Order ID')],
      tanggalPS: new Date(row[headers.indexOf('Tanggal PS')]),
    };
  });
  
  return salesRecords;
};

module.exports = { parseSalesData };
