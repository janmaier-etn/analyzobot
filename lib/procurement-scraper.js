/**
 * Public Procurement Scraper
 * Fetches public tenders and contracts using HlidacStatu.cz API
 * API Documentation: https://www.hlidacstatu.cz/api
 */

import axios from 'axios';

const HLIDAC_STATU_API = 'https://www.hlidacstatu.cz/api/v2';

export class ProcurementScraper {
    /**
     * Get public procurement contracts for company by IČO
     * @param {string} ico - Company IČO
     * @param {number} limit - Max number of results
     * @returns {Promise<Array>} List of contracts
     */
    async getContracts(ico, limit = 20) {
        try {
            console.log(`Fetching procurement contracts for IČO: ${ico}`);

            // Search for contracts where company is either supplier or customer
            const contracts = await this.searchContracts(ico, limit);

            // Filter relevant IT/digitalization contracts
            const relevantContracts = this.filterRelevantContracts(contracts);

            return relevantContracts;
        } catch (error) {
            console.error('Procurement scraper error:', error.message);
            return [];
        }
    }

    /**
     * Search contracts in HlidacStatu API
     * @param {string} ico - Company IČO
     * @param {number} limit - Max results
     * @returns {Promise<Array>} Contracts
     */
    async searchContracts(ico, limit) {
        try {
            // HlidacStatu.cz API endpoint for public contracts (Veřejné zakázky)
            const response = await axios.get(`${HLIDAC_STATU_API}/verejnezakazky/hledat`, {
                params: {
                    q: `ico:${ico}`,
                    sort: 'posledniZmena desc',
                    page: 1,
                    pageSize: limit
                },
                timeout: 15000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.data || !response.data.results) {
                return [];
            }

            return response.data.results.map(contract => this.parseContract(contract));
        } catch (error) {
            // API might not be accessible or rate limited
            console.log('HlidacStatu API not available, trying alternative approach:', error.message);
            return [];
        }
    }

    /**
     * Parse contract from HlidacStatu format
     * @param {Object} contract - Raw contract data
     * @returns {Object} Parsed contract
     */
    parseContract(contract) {
        return {
            id: contract.id,
            title: contract.nazev || 'Bez názvu',
            description: contract.popis || '',
            price: contract.konecnaHodnotaBezDph || contract.odhadovanaHodnotaBezDph,
            currency: 'CZK',
            status: this.getContractStatus(contract),
            datePublished: contract.datumUverejneni,
            deadline: contract.lhutaDoruceni,
            customer: {
                name: contract.zadavatel?.nazev,
                ico: contract.zadavatel?.ico
            },
            url: `https://www.hlidacstatu.cz/verejnezakazky/${contract.id}`,
            categories: this.extractCategories(contract),
            isActive: this.isContractActive(contract),
            rawData: contract
        };
    }

    /**
     * Get contract status
     * @param {Object} contract - Contract data
     * @returns {string} Status
     */
    getContractStatus(contract) {
        if (contract.stavVZ) {
            const statusMap = {
                'Probíhající': 'active',
                'Ukončená': 'completed',
                'Zrušená': 'cancelled',
                'Připravovaná': 'planned'
            };
            return statusMap[contract.stavVZ] || contract.stavVZ;
        }
        return 'unknown';
    }

    /**
     * Check if contract is active
     * @param {Object} contract - Contract data
     * @returns {boolean} Is active
     */
    isContractActive(contract) {
        if (contract.lhutaDoruceni) {
            const deadline = new Date(contract.lhutaDoruceni);
            return deadline > new Date();
        }
        return contract.stavVZ === 'Probíhající';
    }

    /**
     * Extract categories/CPV codes from contract
     * @param {Object} contract - Contract data
     * @returns {Array} Categories
     */
    extractCategories(contract) {
        const categories = [];

        if (contract.cpv && Array.isArray(contract.cpv)) {
            categories.push(...contract.cpv.map(c => c.nazev || c.kod));
        }

        return categories;
    }

    /**
     * Filter contracts relevant for IT/digitalization
     * @param {Array} contracts - List of contracts
     * @returns {Array} Filtered contracts
     */
    filterRelevantContracts(contracts) {
        const itKeywords = [
            'software', 'aplikace', 'systém', 'it', 'informační',
            'digitalizace', 'cloud', 'web', 'portal', 'databáze',
            'automatizace', 'analýza', 'data', 'mobilní', 'eshop',
            'e-shop', 'crm', 'erp', 'technologie', 'programování'
        ];

        return contracts.filter(contract => {
            const text = `${contract.title} ${contract.description}`.toLowerCase();
            return itKeywords.some(keyword => text.includes(keyword));
        });
    }

    /**
     * Get active tenders (probíhající výběrová řízení)
     * @param {string} ico - Company IČO
     * @returns {Promise<Array>} Active tenders
     */
    async getActiveTenders(ico) {
        const contracts = await this.getContracts(ico, 50);
        return contracts.filter(c => c.isActive && c.deadline);
    }

    /**
     * Search tenders by keywords (for finding opportunities)
     * @param {Array} keywords - Search keywords
     * @param {number} limit - Max results
     * @returns {Promise<Array>} Matching tenders
     */
    async searchTendersByKeywords(keywords, limit = 20) {
        try {
            const query = keywords.join(' OR ');

            const response = await axios.get(`${HLIDAC_STATU_API}/verejnezakazky/hledat`, {
                params: {
                    q: query,
                    sort: 'posledniZmena desc',
                    page: 1,
                    pageSize: limit
                },
                timeout: 15000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.data || !response.data.results) {
                return [];
            }

            return response.data.results
                .map(contract => this.parseContract(contract))
                .filter(c => c.isActive);
        } catch (error) {
            console.error('Tender search error:', error.message);
            return [];
        }
    }

    /**
     * Get procurement summary for company
     * @param {string} ico - Company IČO
     * @returns {Promise<Object>} Summary
     */
    async getProcurementSummary(ico) {
        const contracts = await this.getContracts(ico);
        const activeTenders = contracts.filter(c => c.isActive);

        return {
            totalContracts: contracts.length,
            activeTenders: activeTenders.length,
            contracts: contracts,
            hasActiveOpportunities: activeTenders.length > 0,
            itContracts: contracts.filter(c =>
                c.categories.some(cat =>
                    cat.toLowerCase().includes('software') ||
                    cat.toLowerCase().includes('it')
                )
            ).length
        };
    }
}
