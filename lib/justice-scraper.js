/**
 * Justice.cz Scraper
 * Fetches annual reports from Czech justice.cz (Sbírka listin)
 * Note: This is a simplified version. Full implementation would need more robust scraping.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const JUSTICE_BASE_URL = 'https://or.justice.cz/ias/ui';

export class JusticeScraper {
    /**
     * Get annual reports for company by IČO
     * @param {string} ico - Company IČO
     * @param {number} years - Number of years to fetch
     * @returns {Promise<Array>} List of annual reports
     */
    async getAnnualReports(ico, years = 3) {
        try {
            console.log(`Fetching annual reports for IČO: ${ico}`);

            // Search for company in justice.cz
            const companyUrl = await this.findCompanyUrl(ico);

            if (!companyUrl) {
                console.log('Company not found in justice.cz registry');
                return [];
            }

            // Fetch documents list
            const reports = await this.fetchDocumentsList(companyUrl, years);

            return reports;
        } catch (error) {
            console.error('Justice.cz scraper error:', error.message);
            // Don't throw - annual reports are optional
            return [];
        }
    }

    /**
     * Find company URL in justice.cz by IČO
     * @param {string} ico - Company IČO
     * @returns {Promise<string|null>} Company URL or null
     */
    async findCompanyUrl(ico) {
        try {
            const searchUrl = `${JUSTICE_BASE_URL}/rejstrik-$firma?ico=${ico}`;

            const response = await axios.get(searchUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // Parse HTML to find company detail link
            const $ = cheerio.load(response.data);

            // Find link to company detail page
            const companyLink = $('a[href*="vypis-sl"]').first().attr('href');

            if (companyLink) {
                return companyLink.startsWith('http') ? companyLink : `${JUSTICE_BASE_URL}${companyLink}`;
            }

            return null;
        } catch (error) {
            console.error('Error finding company URL:', error.message);
            return null;
        }
    }

    /**
     * Fetch list of documents from company page
     * @param {string} companyUrl - Company detail URL
     * @param {number} years - Number of years
     * @returns {Promise<Array>} List of documents
     */
    async fetchDocumentsList(companyUrl, years) {
        try {
            const response = await axios.get(companyUrl, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const reports = [];

            // Look for links to annual reports in "Sbírka listin"
            // This is simplified - actual implementation would need more sophisticated parsing
            $('a[href*="dokumenty"]').each((i, elem) => {
                const text = $(elem).text().toLowerCase();

                if (text.includes('výroční zpráva') || text.includes('účetní závěrka')) {
                    const link = $(elem).attr('href');
                    const year = this.extractYear(text);

                    if (year && this.isWithinYears(year, years)) {
                        reports.push({
                            title: $(elem).text().trim(),
                            url: link.startsWith('http') ? link : `${JUSTICE_BASE_URL}${link}`,
                            year: year,
                            type: text.includes('výroční zpráva') ? 'annual_report' : 'financial_statement'
                        });
                    }
                }
            });

            return reports;
        } catch (error) {
            console.error('Error fetching documents list:', error.message);
            return [];
        }
    }

    /**
     * Extract year from text
     * @param {string} text - Text containing year
     * @returns {number|null} Year or null
     */
    extractYear(text) {
        const yearMatch = text.match(/20\d{2}/);
        return yearMatch ? parseInt(yearMatch[0]) : null;
    }

    /**
     * Check if year is within specified range
     * @param {number} year - Year to check
     * @param {number} yearsBack - Number of years back
     * @returns {boolean} True if within range
     */
    isWithinYears(year, yearsBack) {
        const currentYear = new Date().getFullYear();
        return year >= currentYear - yearsBack && year <= currentYear;
    }

    /**
     * Download and extract text from PDF report
     * @param {string} url - PDF URL
     * @returns {Promise<string>} Extracted text
     */
    async downloadAndExtractPDF(url) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // Note: PDF parsing would be done here using pdf-parse
            // For now, we'll return a placeholder
            // In a real implementation, you would use:
            // const pdfParse = require('pdf-parse');
            // const data = await pdfParse(response.data);
            // return data.text;

            return '[PDF content would be extracted here]';
        } catch (error) {
            console.error('Error downloading PDF:', error.message);
            throw error;
        }
    }

    /**
     * Get summary of available reports
     * @param {string} ico - Company IČO
     * @returns {Promise<Object>} Summary of reports
     */
    async getReportsSummary(ico) {
        const reports = await this.getAnnualReports(ico);

        return {
            totalReports: reports.length,
            years: reports.map(r => r.year),
            hasRecentReports: reports.length > 0,
            reports: reports
        };
    }
}
