/**
 * API Endpoint: Download Annual Report
 * Proxies PDF downloads from justice.cz with proper headers
 */

import axios from 'axios';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parametr je povinný' });
        }

        // Validate that URL is from allowed domains
        const allowedDomains = ['justice.cz', 'w3.org']; // w3.org for testing
        const isAllowed = allowedDomains.some(domain => url.includes(domain));

        if (!isAllowed) {
            return res.status(400).json({ error: 'Pouze soubory z ověřených zdrojů jsou povoleny' });
        }

        console.log(`Downloading report from: ${url}`);

        // Fetch the PDF with proper headers
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 60000, // 60 seconds for large PDFs
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/pdf,*/*',
                'Referer': 'https://or.justice.cz/',
            },
            maxRedirects: 5,
        });

        // Extract filename from URL or Content-Disposition header
        let filename = 'vyrocni-zprava.pdf';

        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        } else {
            // Try to extract from URL
            const urlParts = url.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart.endsWith('.pdf')) {
                filename = lastPart;
            }
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', response.data.length);

        // Send the PDF
        return res.status(200).send(response.data);

    } catch (error) {
        console.error('Download Report Error:', error);

        if (error.response) {
            return res.status(error.response.status).json({
                error: 'Chyba při stahování souboru',
                details: error.message
            });
        }

        return res.status(500).json({
            error: 'Nepodařilo se stáhnout výroční zprávu',
            details: error.message
        });
    }
}
