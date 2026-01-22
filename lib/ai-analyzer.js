/**
 * AI Analyzer
 * Generates PESTLE and Porter analysis using Claude or OpenAI API
 */

import axios from 'axios';

export class AIAnalyzer {
    constructor(apiKey, provider = 'anthropic') {
        this.apiKey = apiKey;
        this.provider = provider;

        // API endpoints
        this.endpoints = {
            anthropic: 'https://api.anthropic.com/v1/messages',
            openai: 'https://api.openai.com/v1/chat/completions'
        };
    }

    /**
     * Generate PESTLE and Porter analysis
     * @param {Object} companyData - Company data from ARES
     * @param {Array} pdfTexts - Extracted PDF texts from uploaded annual reports
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeCompany(companyData, pdfTexts = []) {
        try {
            const prompt = this.buildAnalysisPrompt(companyData, pdfTexts);

            const analysis = this.provider === 'anthropic'
                ? await this.analyzeWithClaude(prompt)
                : await this.analyzeWithOpenAI(prompt);

            return this.parseAnalysis(analysis);
        } catch (error) {
            console.error('AI Analysis error:', error.message);
            throw new Error('Nepodařilo se provést AI analýzu: ' + error.message);
        }
    }

    /**
     * Build analysis prompt
     * @param {Object} companyData - Company data
     * @param {Array} pdfTexts - Extracted PDF texts
     * @returns {string} Prompt
     */
    buildAnalysisPrompt(companyData, pdfTexts) {
        const hasReports = pdfTexts && pdfTexts.length > 0;

        return `Jsi business development expert pro Etnetera Group - významnou IT a digitální agenturu. Analyzuješ následující firmu jako POTENCIÁLNÍHO KLIENTA.

INFORMACE O FIRMĚ:
- Název: ${companyData.name}
- IČO: ${companyData.ico}
- Právní forma: ${companyData.legalForm}
- Sídlo: ${companyData.address}
- Stav: ${companyData.status}
- Odvětví: ${companyData.industryDescription}
- NACE kód: ${companyData.naceCode || 'Neuvedeno'}

${hasReports ? `
--- VÝROČNÍ ZPRÁVY (${pdfTexts.length}x) ---
${pdfTexts.map((pdf, i) => `
DOKUMENT ${i + 1}: ${pdf.filename}
${pdf.text ? pdf.text.substring(0, 3000) + '...' : 'Nelze extrahovat text'}
`).join('\n')}
--- KONEC VÝROČNÍCH ZPRÁV ---
` : '- Výroční zprávy nejsou k dispozici'}

SLUŽBY ETNETERA GROUP:
- Software development & engineering
- Digital transformation & strategy
- Cloud & DevOps
- Data analytics & AI/ML
- E-commerce & digital platforms
- Mobile development
- UX/UI design

ÚKOL:
Vytvoř sales-focused analýzu ve formátu JSON:

{
  "pestle": {
    "political": "Politické faktory a jejich dopad na digitální investice firmy (2-3 věty)",
    "economic": "Ekonomické faktory a investiční kapacita firmy (2-3 věty)",
    "social": "Sociální trendy relevantní pro digitalizaci (2-3 věty)",
    "technological": "Technologické výzvy a příležitosti pro IT rozvoj (2-3 věty)",
    "legal": "Právní požadavky na IT a compliance (2-3 věty)",
    "environmental": "ESG a sustainability požadavky na digitalizaci (2-3 věty)"
  },
  "porter": {
    "suppliers": "IT závislosti a outsourcing potenciál (2-3 věty)",
    "buyers": "Digitální očekávání zákazníků (2-3 věty)",
    "newEntrants": "Digitální konkurence a inovace (2-3 věty)",
    "substitutes": "Technologické alternativy a modernizace (2-3 věty)",
    "rivalry": "Konkurenční tlaky na digitální transformaci (2-3 věty)"
  },
  "opportunities": {
    "digitalGaps": "Konkrétní digitální mezery a slabiny (3-4 bullet pointy, co firma pravděpodobně potřebuje zlepšit)",
    "techStack": "Odhad technologického stacku a možné modernizace (co pravděpodobně používají a co by mohli upgradovat)",
    "growthChallenges": "Hlavní výzvy růstu které IT může vyřešit (3-4 konkrétní výzvy)",
    "procurementInsights": "Analýza veřejných zakázek - co firma nakupuje, jaké IT projekty řeší, kde můžeme nabídnout naše služby",
    "salesPitch": "Konkrétní sales pitch pro Etnetera Group - jak je oslovit, s čím přijít, jaké projekty nabídnout (4-5 vět, velmi konkrétní)"
  }
}

POKYNY:
1. Mysli jako sales consultant - hledej příležitosti pro Etnetera Group
2. V sekci "opportunities" buď VELMI konkrétní a praktický
3. Sales pitch by měl obsahovat konkrétní doporučení co nabídnout
4. Zaměř se na velké korporace - enterprise projekty
5. Zvažuj odvětví firmy a jejich specifické IT potřeby
6. Odpověz POUZE validním JSON objektem

JSON ODPOVĚĎ:`;
    }

    /**
     * Analyze with Claude API
     * @param {string} prompt - Analysis prompt
     * @returns {Promise<string>} Analysis response
     */
    async analyzeWithClaude(prompt) {
        try {
            const response = await axios.post(
                this.endpoints.anthropic,
                {
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 2000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    timeout: 30000
                }
            );

            return response.data.content[0].text;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Neplatný API klíč pro Claude');
            }
            throw new Error('Chyba při komunikaci s Claude API: ' + error.message);
        }
    }

    /**
     * Analyze with OpenAI API
     * @param {string} prompt - Analysis prompt
     * @returns {Promise<string>} Analysis response
     */
    async analyzeWithOpenAI(prompt) {
        try {
            const response = await axios.post(
                this.endpoints.openai,
                {
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Jsi expert na strategickou analýzu firem. Odpovídáš vždy ve formátu JSON.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    timeout: 30000
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Neplatný API klíč pro OpenAI');
            }
            throw new Error('Chyba při komunikaci s OpenAI API: ' + error.message);
        }
    }

    /**
     * Parse analysis response
     * @param {string} response - Raw API response
     * @returns {Object} Parsed analysis
     */
    parseAnalysis(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Odpověď neobsahuje validní JSON');
            }

            const analysis = JSON.parse(jsonMatch[0]);

            // Validate structure
            if (!analysis.pestle || !analysis.porter) {
                throw new Error('Neplatná struktura analýzy');
            }

            return analysis;
        } catch (error) {
            console.error('Error parsing analysis:', error.message);

            // Return fallback analysis
            return this.getFallbackAnalysis();
        }
    }

    /**
     * Get fallback analysis when AI fails
     * @returns {Object} Fallback analysis
     */
    getFallbackAnalysis() {
        return {
            pestle: {
                political: 'Politické prostředí v ČR je stabilní, což podporuje dlouhodobé IT investice. Pro detailní analýzu potřebujeme více dat.',
                economic: 'Ekonomické faktory ovlivňují investiční kapacitu. Odvětví firmy má své specifické ekonomické výzvy.',
                social: 'Digitální trendy a očekávání zákazníků se rychle mění. Firma musí držet krok s digitalizací.',
                technological: 'Technologický vývoj vytváří příležitosti pro modernizaci IT infrastruktury a procesů.',
                legal: 'Compliance a GDPR vyžadují moderní IT systémy. Legislativní změny mohou vyžadovat technologické úpravy.',
                environmental: 'ESG požadavky rostou. Green IT a sustainability reporting vyžadují technologická řešení.'
            },
            porter: {
                suppliers: 'IT závislosti vytvářejí prostor pro strategic outsourcing. Partnerství s IT firmou může snížit rizika.',
                buyers: 'Zákazníci očekávají digitální služby a seamless UX. Zastaralé systémy mohou znamenat konkurenční nevýhodu.',
                newEntrants: 'Digitální konkurenti mohou disruptovat trh. Investice do IT jsou klíčové pro udržení pozice.',
                substitutes: 'Nové technologie a platformy nabízejí alternativy. Modernizace je nutná pro zůstání relevantní.',
                rivalry: 'Konkurence je silně závislá na digitálních schopnostech. IT excellence je competitive advantage.'
            },
            opportunities: {
                digitalGaps: '• Pravděpodobně zastaralé legacy systémy\n• Možnosti pro automatizaci procesů\n• Nedostatečná integrace systémů\n• Slabé data analytics capabilities',
                techStack: 'Firma pravděpodobně používá mix legacy a moderních technologií. Příležitosti pro cloud migration, API modernizaci a data platform upgrade.',
                growthChallenges: '• Škálování IT infrastruktury\n• Digitalizace customer experience\n• Integrace nových digitálních kanálů\n• Data-driven decision making',
                procurementInsights: 'Pro přesnou analýzu veřejných zakázek jsou potřeba dodatečná data. Doporučujeme monitoring výběrových řízení relevantních pro IT služby.',
                salesPitch: 'Oslovte je s digital transformation roadmap. Nabídněte assessment jejich současného IT stacku a konkrétní quick wins. Zaměřte se na ROI z modernizace a case studies z podobného odvětví. Etnetera Group má zkušenosti s enterprise projekty a může dodat kompletní řešení od strategie po implementaci.'
            }
        };
    }
}
