// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Method not allowed' });
//     }

//     try {
//         const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
//         const response = await fetch(`${backendUrl}/api/dashboard/export`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(req.body),
//         });

//         if (!response.ok) {
//             throw new Error('Export failed');
//         }

//         const buffer = await response.arrayBuffer();

//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename=sales-performance-export.xlsx');
//         res.send(Buffer.from(buffer));
//     } catch (error) {
//         console.error('Export error:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Failed to export data'
//         });
//     }
// }