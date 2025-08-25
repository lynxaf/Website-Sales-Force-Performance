// import { NextApiRequest, NextApiResponse } from 'next';
// import formidable from 'formidable';
// import fs from 'fs';

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Method not allowed' });
//     }

//     try {
//         const form = formidable({
//             uploadDir: '/tmp',
//             keepExtensions: true,
//             maxFileSize: 10 * 1024 * 1024, // 10MB
//         });

//         const [fields, files] = await form.parse(req);
//         console.log('Parsed files:', files);

//         const file = files.excelFile || files.sales_data;
//         const fileToProcess = Array.isArray(file) ? file[0] : file;

//         if (!fileToProcess) {
//             console.log('No file found in request. Available fields:', Object.keys(files));
//             return res.status(400).json({
//                 success: false,
//                 msg: 'No file uploaded',
//             });
//         }

//         console.log('File details:', {
//             originalFilename: fileToProcess.originalFilename,
//             filepath: fileToProcess.filepath,
//             mimetype: fileToProcess.mimetype,
//             size: fileToProcess.size,
//         });

//         const formData = new FormData();
//         const buffer = fs.readFileSync(fileToProcess.filepath);

//         formData.append(
//             'sales_data',
//             new File(
//                 [buffer],
//                 fileToProcess.originalFilename || 'upload.xlsx',
//                 {
//                     type: fileToProcess.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//                 }
//             )
//         );

//         const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
//         console.log('Sending to backend:', `${backendUrl}/api/dashboard/upload`);

//         const response = await fetch(`${backendUrl}/api/dashboard/upload`, {
//             method: 'POST',
//             body: formData,
//         });

//         console.log('Backend response status:', response.status);

//         let result;
//         try {
//             result = await response.json();
//         } catch (jsonError) {
//             const textResult = await response.text();
//             console.log('Backend response (text):', textResult);
//             throw new Error(`Backend returned non-JSON response: ${textResult}`);
//         }

//         console.log('Backend result:', result);

//         if (fs.existsSync(fileToProcess.filepath)) {
//             fs.unlinkSync(fileToProcess.filepath);
//             console.log('Temp file cleaned up');
//         }

//         res.status(response.status).json(result);
//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({
//             success: false,
//             msg: 'Server error during upload',
//             error: error instanceof Error ? error.message : 'Unknown error',
//         });
//     }
// }
