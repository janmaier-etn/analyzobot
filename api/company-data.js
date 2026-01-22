/**
 * API Endpoint: Get Company Data
 * Fetches company data from ARES and annual reports from justice.cz
 */

import { AresClient } from '../lib/ares-client.js';
import { JusticeScraper } from '../lib/justice-scraper.js';

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
        const { ico } = req.query;

        // Validate IČO
        if (!ico) {
            return res.status(400).json({ error: 'IČO je povinné' });
        }

        if (!/^\d{8}$/.test(ico)) {
            return res.status(400).json({ error: 'IČO musí mít 8 číslic' });
        }

        console.log(`Fetching data for IČO: ${ico}`);

        // Initialize clients
        const aresClient = new AresClient();
        const justiceScraper = new JusticeScraper();

        // Get company data from ARES
        const companyData = await aresClient.getCompanyByIco(ico);

        // Try to get annual reports from justice.cz
        let annualReports = [];
        try {
            const reportsSummary = await justiceScraper.getReportsSummary(ico);
            annualReports = reportsSummary.reports || [];
        } catch (error) {
            console.log('Could not fetch annual reports:', error.message);
            // Continue without reports
        }

        // Return combined data
        return res.status(200).json({
            ...companyData,
            annualReports: annualReports,
            hasAnnualReports: annualReports.length > 0
        });

    } catch (error) {
        console.error('API Error:', error);

        if (error.message.includes('nebyla nalezena')) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({
            error: 'Nepodařilo se získat data o firmě',
            details: error.message
        });
    }
}
