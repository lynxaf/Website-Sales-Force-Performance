import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        const file = Array.isArray(files.excelFile) ? files.excelFile[0] : files.excelFile;

        if (!file) {
            return res.status(400).json({
                success: false,
                msg: 'No file uploaded'
            });
        }

        // Create form data to send to backend
        const formData = new FormData();
        formData.append('excelFile', fs.createReadStream(file.filepath), {
            filename: file.originalFilename || 'upload.xlsx',
            contentType: file.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/dashboard/upload`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        // Clean up temp file
        fs.unlinkSync(file.filepath);

        res.status(response.status).json(result);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            msg: 'Server error during upload'
        });
    }
}