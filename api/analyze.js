/**
 * API Endpoint: Analyze Company
 * Generates PESTLE and Porter analysis using AI
 */

import { AIAnalyzer } from '../lib/ai-analyzer.js';

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

        console.log(`Analyzing company: ${companyData.name}`);

        // Get API key and provider from environment
        const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
        const provider = process.env.AI_PROVIDER || (process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai');

        if (!apiKey) {
            return res.status(500).json({
                error: 'AI API klíč není nakonfigurován',
                details: 'Nastavte ANTHROPIC_API_KEY nebo OPENAI_API_KEY v .env souboru'
            });
        }

        // Initialize AI analyzer
        const analyzer = new AIAnalyzer(apiKey, provider);

        // Perform analysis
        const analysis = await analyzer.analyzeCompany(
            companyData,
            companyData.annualReports || []
        );

        return res.status(200).json(analysis);

    } catch (error) {
        console.error('Analysis API Error:', error);

        return res.status(500).json({
            error: 'Nepodařilo se provést analýzu',
            details: error.message
        });
    }
}
