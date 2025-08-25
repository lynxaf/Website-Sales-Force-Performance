// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse
// ) {
//     if (req.method !== 'GET') {
//         return res.status(405).json({ message: 'Method not allowed' });
//     }

//     try {
//         const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
//         const response = await fetch(`${backendUrl}/api/dashboard/metrics`);
//         const data = await response.json();

//         res.status(200).json(data);
//     } catch (error) {
//         console.error('Error fetching metrics data:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Failed to fetch metrics data'
//         });
//     }
// }