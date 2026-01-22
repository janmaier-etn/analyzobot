/**
 * API Endpoint: Find Vendors
 * Finds relevant IT vendors for the company
 */

import { VendorMatcher } from '../lib/vendor-matcher.js';

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

        if (!companyData) {
            return res.status(400).json({ error: 'Data o firmě jsou povinná' });
        }

        console.log(`Finding vendors for company: ${companyData.name}`);

        // Initialize vendor matcher
        const vendorMatcher = new VendorMatcher();

        // Find relevant vendors
        const vendors = await vendorMatcher.findVendors(companyData, 20);

        return res.status(200).json(vendors);

    } catch (error) {
        console.error('Vendor matching API Error:', error);

        return res.status(500).json({
            error: 'Nepodařilo se najít dodavatele',
            details: error.message
        });
    }
}
