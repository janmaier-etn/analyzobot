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
     * @param {Array} pdfFiles - Optional uploaded PDF files
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeCompany(ico, onProgress, pdfFiles = []) {
        try {
            // Step 1: Get company data
            onProgress({ step: 1, message: 'Získávám data o firmě...' });
            const companyData = await this.getCompanyData(ico);

            // Step 2: Upload and extract PDFs if provided
            let pdfTexts = [];
            if (pdfFiles && pdfFiles.length > 0) {
                onProgress({ step: 2, message: 'Zpracovávám nahrané výroční zprávy...' });
                pdfTexts = await this.uploadPDFs(pdfFiles);
            }

            // Step 3: Analyze with AI (includes opportunities)
            onProgress({ step: 3, message: 'Provádím AI analýzu a hledám příležitosti...' });
            const analysis = await this.getAnalysis(companyData, pdfTexts);

            // Step 4: Get procurement data
            onProgress({ step: 4, message: 'Získávám veřejné zakázky...' });
            const procurement = await this.getProcurement(companyData);

            return {
                company: companyData,
                analysis: analysis,
                procurement: procurement
            };
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(error.message || 'Chyba při komunikaci se serverem');
        }
    }

    /**
     * Upload and extract text from PDFs
     * @param {Array} pdfFiles - PDF files to upload
     * @returns {Promise<Array>} Extracted text from PDFs
     */
    async uploadPDFs(pdfFiles) {
        const formData = new FormData();

        pdfFiles.forEach((file, index) => {
            formData.append(`pdf${index}`, file);
        });

        const response = await fetch(`${API_BASE}/upload-pdfs`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Nepodařilo se nahrát PDF soubory');
        }

        const result = await response.json();
        return result.texts || [];
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
     * @param {Array} pdfTexts - Optional extracted PDF texts
     * @returns {Promise<Object>} Analysis results
     */
    async getAnalysis(companyData, pdfTexts = []) {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyData, pdfTexts })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Nepodařilo se provést analýzu');
        }

        return await response.json();
    }

    /**
     * Get procurement data
     * @param {Object} companyData - Company data
     * @returns {Promise<Object>} Procurement data
     */
    async getProcurement(companyData) {
        const response = await fetch(`${API_BASE}/procurement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyData })
        });

        if (!response.ok) {
            const error = await response.json();
            console.warn('Procurement data not available:', error.error);
            // Return empty data instead of throwing
            return {
                totalContracts: 0,
                activeTenders: 0,
                itContracts: 0,
                contracts: [],
                hasActiveOpportunities: false
            };
        }

        return await response.json();
    }

}
