/**
 * PDF Exporter
 * Exports analysis results to PDF format using html2pdf
 */

export class PDFExporter {
    constructor() {
        // Load html2pdf library dynamically
        this.loadLibrary();
    }

    /**
     * Load html2pdf library
     */
    async loadLibrary() {
        if (window.html2pdf) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Export analysis to PDF
     * @param {Object} companyData - Company information
     * @param {Object} analysis - Analysis results
     */
    async exportToPDF(companyData, analysis) {
        // Ensure library is loaded
        await this.loadLibrary();

        // Create HTML content
        const htmlContent = this.generateHTML(companyData, analysis);

        // Create temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '210mm';
        document.body.appendChild(container);

        try {
            // PDF options
            const opt = {
                margin: [15, 15, 20, 15],
                filename: `analyza_${companyData.ico}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Generate PDF
            await html2pdf().set(opt).from(container).save();
        } finally {
            // Remove temporary container
            document.body.removeChild(container);
        }
    }

    /**
     * Generate HTML content for PDF
     */
    generateHTML(companyData, analysis) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #2d3748;
            line-height: 1.6;
            font-size: 11pt;
        }

        .pdf-container {
            max-width: 180mm;
            margin: 0 auto;
            padding: 10mm;
        }

        h1 {
            color: #0066cc;
            font-size: 24pt;
            margin-bottom: 5mm;
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 3mm;
        }

        h2 {
            color: #0066cc;
            font-size: 16pt;
            margin-top: 8mm;
            margin-bottom: 4mm;
            border-left: 4px solid #0066cc;
            padding-left: 3mm;
            page-break-after: avoid;
        }

        h3 {
            color: #2d3748;
            font-size: 12pt;
            margin-top: 4mm;
            margin-bottom: 2mm;
            font-weight: 600;
            page-break-after: avoid;
        }

        .company-info {
            background: #f7fafc;
            padding: 4mm;
            border-radius: 2mm;
            margin-bottom: 6mm;
            border: 1px solid #e2e8f0;
        }

        .info-row {
            margin-bottom: 2mm;
            display: flex;
        }

        .info-label {
            font-weight: 600;
            min-width: 25mm;
            color: #4a5568;
        }

        .info-value {
            color: #2d3748;
            flex: 1;
        }

        .section {
            margin-bottom: 6mm;
            page-break-inside: avoid;
        }

        .subsection {
            margin-bottom: 4mm;
            padding-left: 3mm;
            page-break-inside: avoid;
        }

        p {
            margin-bottom: 3mm;
            text-align: justify;
            hyphens: auto;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .section-subtitle {
            color: #718096;
            font-size: 10pt;
            font-style: italic;
            margin-bottom: 3mm;
        }

        .footer {
            margin-top: 10mm;
            padding-top: 3mm;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 9pt;
            color: #718096;
        }

        ul {
            margin-left: 5mm;
            margin-bottom: 3mm;
        }

        li {
            margin-bottom: 1mm;
        }

        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <h1>AnalyzoBot - AI Analýza Firmy</h1>

        <div class="section">
            <h2>Základní informace o firmě</h2>
            <div class="company-info">
                <div class="info-row">
                    <span class="info-label">Název:</span>
                    <span class="info-value">${this.escape(companyData.name)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">IČO:</span>
                    <span class="info-value">${this.escape(companyData.ico)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sídlo:</span>
                    <span class="info-value">${this.escape(companyData.address)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Právní forma:</span>
                    <span class="info-value">${this.escape(companyData.legalForm)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Stav:</span>
                    <span class="info-value">${this.escape(companyData.status)}</span>
                </div>
            </div>
        </div>

        ${analysis.pestle ? `
        <div class="section page-break">
            <h2>PESTLE Analýza</h2>
            <p class="section-subtitle">Analýza makroekonomického prostředí firmy</p>

            <div class="subsection">
                <h3>🏛️ Political (Politické)</h3>
                <p>${this.formatText(analysis.pestle.political)}</p>
            </div>

            <div class="subsection">
                <h3>💰 Economic (Ekonomické)</h3>
                <p>${this.formatText(analysis.pestle.economic)}</p>
            </div>

            <div class="subsection">
                <h3>👥 Social (Sociální)</h3>
                <p>${this.formatText(analysis.pestle.social)}</p>
            </div>

            <div class="subsection">
                <h3>🔬 Technological (Technologické)</h3>
                <p>${this.formatText(analysis.pestle.technological)}</p>
            </div>

            <div class="subsection">
                <h3>⚖️ Legal (Právní)</h3>
                <p>${this.formatText(analysis.pestle.legal)}</p>
            </div>

            <div class="subsection">
                <h3>🌍 Environmental (Environmentální)</h3>
                <p>${this.formatText(analysis.pestle.environmental)}</p>
            </div>
        </div>
        ` : ''}

        ${analysis.porter ? `
        <div class="section page-break">
            <h2>Porter's Five Forces</h2>
            <p class="section-subtitle">Analýza konkurenčního prostředí</p>

            <div class="subsection">
                <h3>🤝 Vyjednávací síla dodavatelů</h3>
                <p>${this.formatText(analysis.porter.suppliers)}</p>
            </div>

            <div class="subsection">
                <h3>🛒 Vyjednávací síla zákazníků</h3>
                <p>${this.formatText(analysis.porter.buyers)}</p>
            </div>

            <div class="subsection">
                <h3>🚪 Hrozba nových konkurentů</h3>
                <p>${this.formatText(analysis.porter.newEntrants)}</p>
            </div>

            <div class="subsection">
                <h3>🔄 Hrozba substitutů</h3>
                <p>${this.formatText(analysis.porter.substitutes)}</p>
            </div>

            <div class="subsection">
                <h3>⚔️ Rivalita v odvětví</h3>
                <p>${this.formatText(analysis.porter.rivalry)}</p>
            </div>
        </div>
        ` : ''}

        ${analysis.opportunities ? `
        <div class="section page-break">
            <h2>🎯 Sales Opportunities pro Etnetera Group</h2>
            <p class="section-subtitle">Příležitosti a doporučení jak firmu oslovit</p>

            ${analysis.opportunities.digitalGaps ? `
            <div class="subsection">
                <h3>🔍 Digitální mezery a slabiny</h3>
                <p>${this.formatText(analysis.opportunities.digitalGaps)}</p>
            </div>
            ` : ''}

            ${analysis.opportunities.techStack ? `
            <div class="subsection">
                <h3>💻 Technologický stack a modernizace</h3>
                <p>${this.formatText(analysis.opportunities.techStack)}</p>
            </div>
            ` : ''}

            ${analysis.opportunities.growthChallenges ? `
            <div class="subsection">
                <h3>📈 Výzvy růstu</h3>
                <p>${this.formatText(analysis.opportunities.growthChallenges)}</p>
            </div>
            ` : ''}

            ${analysis.opportunities.procurementInsights ? `
            <div class="subsection">
                <h3>📋 Veřejné zakázky a výběrová řízení</h3>
                <p>${this.formatText(analysis.opportunities.procurementInsights)}</p>
            </div>
            ` : ''}

            ${analysis.opportunities.salesPitch ? `
            <div class="subsection">
                <h3>💡 Sales Pitch - Jak je oslovit</h3>
                <p>${this.formatText(analysis.opportunities.salesPitch)}</p>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <div class="footer">
            <p>Vygenerováno ${new Date().toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</p>
            <p>AnalyzoBot by Jan Maier pro Etnetera Group</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Escape HTML special characters
     */
    escape(text) {
        if (!text) return 'N/A';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Format text with proper line breaks and bullet points
     */
    formatText(text) {
        if (!text) return 'N/A';

        text = String(text);

        // Convert bullet points
        text = text.replace(/^[•\-\*]\s+/gm, '• ');

        // Convert newlines to HTML breaks
        text = text.replace(/\n/g, '<br>');

        // Escape HTML
        return this.escape(text).replace(/&lt;br&gt;/g, '<br>');
    }
}
