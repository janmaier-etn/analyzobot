/**
 * API Endpoint: Upload and Extract PDFs
 * Accepts PDF files and extracts text content
 */

import Busboy from 'busboy';
import pdfParse from 'pdf-parse';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const pdfs = await parsePDFs(req);
        const texts = [];

        // Extract text from each PDF
        for (const pdf of pdfs) {
            try {
                const data = await pdfParse(pdf.data);
                texts.push({
                    filename: pdf.filename,
                    text: data.text,
                    pages: data.numpages,
                    info: data.info
                });
                console.log(`✅ Extracted ${data.numpages} pages from ${pdf.filename}`);
            } catch (error) {
                console.error(`Error extracting ${pdf.filename}:`, error.message);
                texts.push({
                    filename: pdf.filename,
                    text: '',
                    error: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            count: texts.length,
            texts: texts
        });

    } catch (error) {
        console.error('PDF Upload Error:', error);

        return res.status(500).json({
            error: 'Nepodařilo se zpracovat PDF soubory',
            details: error.message
        });
    }
}

/**
 * Parse multipart form data to extract PDFs
 */
function parsePDFs(req) {
    return new Promise((resolve, reject) => {
        const pdfs = [];
        const busboy = Busboy({ headers: req.headers });

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;

            if (mimeType !== 'application/pdf') {
                file.resume(); // Drain the file stream
                return;
            }

            const chunks = [];

            file.on('data', (chunk) => {
                chunks.push(chunk);
            });

            file.on('end', () => {
                const buffer = Buffer.concat(chunks);
                pdfs.push({
                    fieldname,
                    filename,
                    data: buffer,
                    size: buffer.length
                });
                console.log(`📄 Received: ${filename} (${buffer.length} bytes)`);
            });
        });

        busboy.on('finish', () => {
            resolve(pdfs);
        });

        busboy.on('error', (error) => {
            reject(error);
        });

        req.pipe(busboy);
    });
}
