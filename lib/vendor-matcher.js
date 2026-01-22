/**
 * Vendor Matcher
 * Finds relevant IT vendors based on company needs
 * Uses ARES API to find IT companies by NACE codes and keywords
 */

import { AresClient } from './ares-client.js';

export class VendorMatcher {
    constructor() {
        this.aresClient = new AresClient();

        // IT-related NACE codes
        this.itNaceCodes = [
            '62',    // Počítačové programování, poradenství a související činnosti
            '6201',  // Počítačové programování
            '6202',  // Poradenství v oblasti informačních technologií
            '6203',  // Správa počítačových zařízení a systémů
            '6209',  // Ostatní služby v oblasti informačních technologií
            '63',    // Informační činnosti
            '73',    // Reklama a průzkum trhu
            '7311',  // Činnosti reklamních agentur
            '7312',  // Zprostředkování médií
        ];

        // Keywords for IT services
        this.keywords = {
            software: ['software', 'vývoj aplikací', 'development', 'IT', 'informační systémy'],
            marketing: ['marketing', 'reklama', 'digital', 'online marketing', 'performance marketing'],
            cdp: ['cdp', 'customer data', 'data platform', 'analytics', 'big data'],
            mobile: ['mobile', 'mobilní aplikace', 'ios', 'android', 'app'],
            automation: ['automatizace', 'automation', 'rpa', 'workflow', 'integrace']
        };
    }

    /**
     * Find relevant IT vendors
     * @param {Object} companyData - Company data for context
     * @param {number} limit - Max number of vendors
     * @returns {Promise<Array>} List of vendors
     */
    async findVendors(companyData, limit = 20) {
        try {
            console.log('Searching for IT vendors...');

            // For MVP, we'll use a curated list of known IT companies
            // In production, this would query ARES with NACE codes
            const vendors = await this.getCuratedVendors();

            // Filter and rank vendors based on relevance
            const rankedVendors = this.rankVendors(vendors, companyData);

            return rankedVendors.slice(0, limit);
        } catch (error) {
            console.error('Vendor matching error:', error.message);
            // Return sample vendors as fallback
            return this.getSampleVendors();
        }
    }

    /**
     * Get curated list of IT vendors
     * In production, this would query ARES API
     * @returns {Promise<Array>} List of vendors
     */
    async getCuratedVendors() {
        // This is a sample list for MVP
        // In production, you would query ARES or maintain a database
        return [
            {
                name: 'Heureka Group a.s.',
                ico: '27082440',
                address: 'Praha 7',
                categories: ['software', 'cdp', 'automation'],
                description: 'E-commerce a data analytics',
                contact: 'info@heureka.cz'
            },
            {
                name: 'Mergado technologies s.r.o.',
                ico: '04302907',
                address: 'Brno',
                categories: ['software', 'automation', 'marketing'],
                description: 'Marketing automation a feed management',
                contact: 'info@mergado.cz'
            },
            {
                name: 'Applifting s.r.o.',
                ico: '03676617',
                address: 'Praha',
                categories: ['software', 'mobile', 'automation'],
                description: 'Vývoj mobilních a webových aplikací',
                contact: 'hello@applifting.cz'
            },
            {
                name: 'Productboard, Inc.',
                ico: '05351201',
                address: 'Praha',
                categories: ['software', 'cdp'],
                description: 'Product management software',
                contact: 'support@productboard.com'
            },
            {
                name: 'GoodData Corporation',
                ico: '28239741',
                address: 'Praha',
                categories: ['software', 'cdp', 'automation'],
                description: 'Analytics a business intelligence',
                contact: 'info@gooddata.com'
            },
            {
                name: 'Zonky s.r.o.',
                ico: '04169174',
                address: 'Praha',
                categories: ['software', 'automation'],
                description: 'Fintech a automatizace procesů',
                contact: 'podpora@zonky.cz'
            },
            {
                name: 'Medio Interactive s.r.o.',
                ico: '27407888',
                address: 'Praha',
                categories: ['marketing', 'automation'],
                description: 'Performance marketing a automation',
                contact: 'info@medio.cz'
            },
            {
                name: 'Inmite s.r.o.',
                ico: '24797561',
                address: 'Praha',
                categories: ['software', 'mobile'],
                description: 'Mobilní aplikace a software development',
                contact: 'hello@inmite.eu'
            },
            {
                name: 'Showmax Czech s.r.o.',
                ico: '04255011',
                address: 'Praha',
                categories: ['software', 'mobile', 'cdp'],
                description: 'Streaming technology a aplikace',
                contact: 'help@showmax.com'
            },
            {
                name: 'Avast Software s.r.o.',
                ico: '26220711',
                address: 'Praha',
                categories: ['software', 'automation'],
                description: 'Kybernetická bezpečnost a software',
                contact: 'support@avast.com'
            },
            {
                name: 'Y Soft Corporation, a.s.',
                ico: '26998645',
                address: 'Brno',
                categories: ['software', 'automation'],
                description: 'Enterprise software a automatizace',
                contact: 'info@ysoft.com'
            },
            {
                name: 'Keboola Czech s.r.o.',
                ico: '02508893',
                address: 'Praha',
                categories: ['cdp', 'automation', 'software'],
                description: 'Data platform a analytics',
                contact: 'support@keboola.com'
            },
            {
                name: 'Rossum s.r.o.',
                ico: '05788005',
                address: 'Praha',
                categories: ['automation', 'software'],
                description: 'AI-powered document automation',
                contact: 'hello@rossum.ai'
            },
            {
                name: 'Ataccama Software s.r.o.',
                ico: '27403068',
                address: 'Praha',
                categories: ['cdp', 'software', 'automation'],
                description: 'Data quality a governance',
                contact: 'info@ataccama.com'
            },
            {
                name: 'Livesport s.r.o.',
                ico: '27641660',
                address: 'Praha',
                categories: ['software', 'mobile', 'cdp'],
                description: 'Sport data a mobilní aplikace',
                contact: 'info@livesport.eu'
            },
            {
                name: 'eMan s.r.o.',
                ico: '26212471',
                address: 'Praha',
                categories: ['mobile', 'software', 'automation'],
                description: 'Mobilní aplikace a IoT',
                contact: 'info@eman.cz'
            },
            {
                name: 'Notino s.r.o.',
                ico: '26179181',
                address: 'Brno',
                categories: ['software', 'cdp', 'marketing'],
                description: 'E-commerce technology',
                contact: 'info@notino.cz'
            },
            {
                name: 'Pipedrive Czech s.r.o.',
                ico: '05419671',
                address: 'Praha',
                categories: ['software', 'cdp', 'automation'],
                description: 'CRM a sales automation',
                contact: 'support@pipedrive.com'
            },
            {
                name: 'Smartlook.com s.r.o.',
                ico: '04619307',
                address: 'Brno',
                categories: ['cdp', 'software', 'automation'],
                description: 'Analytics a user tracking',
                contact: 'hello@smartlook.com'
            },
            {
                name: 'Exponea s.r.o.',
                ico: '03321631',
                address: 'Bratislava',
                categories: ['cdp', 'marketing', 'automation'],
                description: 'Customer data platform',
                contact: 'info@exponea.com'
            }
        ];
    }

    /**
     * Rank vendors by relevance
     * @param {Array} vendors - List of vendors
     * @param {Object} companyData - Company data
     * @returns {Array} Ranked vendors
     */
    rankVendors(vendors, companyData) {
        // Simple ranking based on categories
        // In production, this would use ML or more sophisticated matching
        return vendors.sort((a, b) => {
            // Prioritize vendors with more categories
            return b.categories.length - a.categories.length;
        });
    }

    /**
     * Get sample vendors for fallback
     * @returns {Array} Sample vendors
     */
    getSampleVendors() {
        return [
            {
                name: 'Sample IT Company s.r.o.',
                ico: '12345678',
                address: 'Praha',
                categories: ['software', 'automation'],
                description: 'Software development',
                contact: 'info@sample.cz'
            }
        ];
    }

    /**
     * Filter vendors by category
     * @param {Array} vendors - List of vendors
     * @param {string} category - Category to filter
     * @returns {Array} Filtered vendors
     */
    filterByCategory(vendors, category) {
        if (category === 'all') {
            return vendors;
        }

        return vendors.filter(vendor =>
            vendor.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
        );
    }

    /**
     * Search vendors by keywords
     * @param {string} query - Search query
     * @param {number} limit - Max results
     * @returns {Promise<Array>} Search results
     */
    async searchVendors(query, limit = 10) {
        try {
            // Use ARES to search by name
            const results = await this.aresClient.searchCompaniesByName(query, limit);

            // Filter IT-related companies
            return results.filter(company => {
                const nace = company.naceCode;
                return nace && this.itNaceCodes.some(code => nace.startsWith(code));
            });
        } catch (error) {
            console.error('Vendor search error:', error.message);
            return [];
        }
    }
}
