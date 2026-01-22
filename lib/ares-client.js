/**
 * ARES API Client
 * Fetches company data from Czech ARES (Administrativní registr ekonomických subjektů)
 * API Documentation: https://ares.gov.cz/
 */

import axios from 'axios';

const ARES_API_URL = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty';

export class AresClient {
    /**
     * Get company data by IČO
     * @param {string} ico - Company IČO (8 digits)
     * @returns {Promise<Object>} Company data
     */
    async getCompanyByIco(ico) {
        try {
            const response = await axios.get(`${ARES_API_URL}/${ico}`, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.data) {
                throw new Error('Firma nebyla nalezena v registru ARES');
            }

            return this.parseAresResponse(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Firma s tímto IČO nebyla nalezena');
            }

            console.error('ARES API error:', error.message);
            throw new Error('Nepodařilo se získat data z ARES: ' + error.message);
        }
    }

    /**
     * Parse ARES API response to normalized format
     * @param {Object} data - Raw ARES response
     * @returns {Object} Normalized company data
     */
    parseAresResponse(data) {
        const company = {
            ico: data.ico,
            dic: data.dic,
            name: this.extractName(data),
            legalForm: this.extractLegalForm(data),
            address: this.extractAddress(data),
            status: this.extractStatus(data),
            dateEstablished: data.datumVzniku,
            dateTerminated: data.datumZaniku,
            naceCode: this.extractNaceCode(data),
            industryDescription: this.extractIndustryDescription(data),
            rawData: data // Keep raw data for further analysis
        };

        return company;
    }

    /**
     * Extract company name
     * @param {Object} data - ARES data
     * @returns {string} Company name
     */
    extractName(data) {
        return data.obchodniJmeno || data.nazev || 'Neznámý název';
    }

    /**
     * Extract legal form
     * @param {Object} data - ARES data
     * @returns {string} Legal form
     */
    extractLegalForm(data) {
        return data.pravniForma?.nazev || 'Neuvedeno';
    }

    /**
     * Extract address
     * @param {Object} data - ARES data
     * @returns {string} Full address
     */
    extractAddress(data) {
        const sidlo = data.sidlo;
        if (!sidlo) return 'Neuvedeno';

        const parts = [];

        if (sidlo.nazevUlice) parts.push(sidlo.nazevUlice);
        if (sidlo.cisloDomovni) parts.push(sidlo.cisloDomovni);
        if (sidlo.cisloOrientacni) parts.push(`/${sidlo.cisloOrientacni}`);
        if (sidlo.nazevObce) parts.push(`, ${sidlo.nazevObce}`);
        if (sidlo.psc) parts.push(`, ${sidlo.psc}`);

        return parts.join(' ') || 'Neuvedeno';
    }

    /**
     * Extract company status
     * @param {Object} data - ARES data
     * @returns {string} Status
     */
    extractStatus(data) {
        if (data.datumZaniku) {
            return 'Zaniklý';
        }
        if (data.stavSubjektu) {
            return data.stavSubjektu === 'AKTIVNI' ? 'Aktivní' : data.stavSubjektu;
        }
        return 'Aktivní';
    }

    /**
     * Extract NACE code
     * @param {Object} data - ARES data
     * @returns {string|null} NACE code
     */
    extractNaceCode(data) {
        const nace = data.czNace || data.nace;
        if (Array.isArray(nace) && nace.length > 0) {
            return nace[0].kod || null;
        }
        return null;
    }

    /**
     * Extract industry description
     * @param {Object} data - ARES data
     * @returns {string} Industry description
     */
    extractIndustryDescription(data) {
        const nace = data.czNace || data.nace;
        if (Array.isArray(nace) && nace.length > 0) {
            return nace[0].nazev || 'Neuvedeno';
        }
        return 'Neuvedeno';
    }

    /**
     * Search companies by name
     * @param {string} name - Company name
     * @param {number} limit - Max results
     * @returns {Promise<Array>} List of companies
     */
    async searchCompaniesByName(name, limit = 10) {
        try {
            const response = await axios.get(ARES_API_URL, {
                params: {
                    obchodniJmeno: name,
                    start: 0,
                    pocet: limit
                },
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.data?.ekonomickeSubjekty) {
                return [];
            }

            return response.data.ekonomickeSubjekty.map(item => this.parseAresResponse(item));
        } catch (error) {
            console.error('ARES search error:', error.message);
            throw new Error('Nepodařilo se vyhledat firmy v ARES');
        }
    }
}
