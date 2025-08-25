// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

//     const queryParams = new URLSearchParams();
//     if (req.query.regional) queryParams.append('regional', req.query.regional as string);
//     if (req.query.branch) queryParams.append('branch', req.query.branch as string);
//     if (req.query.wok) queryParams.append('wok', req.query.wok as string);
//     if (req.query.category) queryParams.append('category', req.query.category as string);

//     const queryString = queryParams.toString();
//     const url = `${backendUrl}/api/dashboard/overall${queryString ? `?${queryString}` : ''}`;

//     const response = await fetch(url);
//     const data = await response.json();

//     res.status(200).json(data);
//   } catch (error) {
//     console.error('Error fetching overall data:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch overall data'
//     });
//   }
// }