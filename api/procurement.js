/**
 * API Endpoint: Get Public Procurement
 * Fetches public tenders and contracts for the company
 */

import { ProcurementScraper } from '../lib/procurement-scraper.js';

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
        const { companyData } = req.body;

        if (!companyData || !companyData.ico) {
            return res.status(400).json({ error: 'IČO je povinné' });
        }

        console.log(`Fetching procurement data for: ${companyData.name} (${companyData.ico})`);

        // Initialize procurement scraper
        const procurementScraper = new ProcurementScraper();

        // Get procurement summary
        const summary = await procurementScraper.getProcurementSummary(companyData.ico);

        return res.status(200).json(summary);

    } catch (error) {
        console.error('Procurement API Error:', error);

        return res.status(500).json({
            error: 'Nepodařilo se získat data o veřejných zakázkách',
            details: error.message
        });
    }
}
