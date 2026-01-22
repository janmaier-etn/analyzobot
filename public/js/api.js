/**
 * API Client for AnalyzoBot
 * Handles all communication with backend API
 */

const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

export class APIClient {
    /**
     * Fetch company data and analysis
     * @param {string} ico - Company IČO
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeCompany(ico, onProgress) {
        try {
            // Step 1: Get company data
            onProgress({ step: 1, message: 'Získávám data o firmě...' });
            const companyData = await this.getCompanyData(ico);

            // Step 2: Analyze with AI (includes opportunities)
            onProgress({ step: 3, message: 'Provádím AI analýzu a hledám příležitosti...' });
            const analysis = await this.getAnalysis(companyData);

            return {
                company: companyData,
                analysis: analysis
            };
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(error.message || 'Chyba při komunikaci se serverem');
        }
    }

    /**
     * Get company data from ARES and justice.cz
     * @param {string} ico - Company IČO
     * @returns {Promise<Object>} Company data
     */
    async getCompanyData(ico) {
        const response = await fetch(`${API_BASE}/company-data?ico=${ico}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Nepodařilo se získat data o firmě');
        }

        return await response.json();
    }

    /**
     * Get AI analysis (PESTLE & Porter)
     * @param {Object} companyData - Company data to analyze
     * @returns {Promise<Object>} Analysis results
     */
    async getAnalysis(companyData) {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyData })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Nepodařilo se provést analýzu');
        }

        return await response.json();
    }

}
