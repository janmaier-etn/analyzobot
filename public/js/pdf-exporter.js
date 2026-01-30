/**
 * PDF Exporter
 * Exports analysis results to PDF format
 */

import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

export class PDFExporter {
    constructor() {
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.contentWidth = this.pageWidth - (this.margin * 2);
        this.lineHeight = 7;
        this.currentY = this.margin;
    }

    /**
     * Export analysis to PDF
     * @param {Object} companyData - Company information
     * @param {Object} analysis - Analysis results
     */
    async exportToPDF(companyData, analysis) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        this.currentY = this.margin;

        // Title
        this.addTitle(doc, 'AnalyzoBot - AI Analýza Firmy');
        this.currentY += 10;

        // Company Info
        this.addSectionHeader(doc, 'Základní informace o firmě');
        this.addText(doc, `Název: ${companyData.name}`);
        this.addText(doc, `IČO: ${companyData.ico}`);
        this.addText(doc, `Sídlo: ${companyData.address}`);
        this.addText(doc, `Právní forma: ${companyData.legalForm}`);
        this.addText(doc, `Stav: ${companyData.status}`);
        this.currentY += 5;

        // PESTLE Analysis
        if (analysis.pestle) {
            this.addSectionHeader(doc, 'PESTLE Analýza');

            this.addSubsectionHeader(doc, 'Political (Politické)');
            this.addWrappedText(doc, analysis.pestle.political);

            this.addSubsectionHeader(doc, 'Economic (Ekonomické)');
            this.addWrappedText(doc, analysis.pestle.economic);

            this.addSubsectionHeader(doc, 'Social (Sociální)');
            this.addWrappedText(doc, analysis.pestle.social);

            this.addSubsectionHeader(doc, 'Technological (Technologické)');
            this.addWrappedText(doc, analysis.pestle.technological);

            this.addSubsectionHeader(doc, 'Legal (Právní)');
            this.addWrappedText(doc, analysis.pestle.legal);

            this.addSubsectionHeader(doc, 'Environmental (Environmentální)');
            this.addWrappedText(doc, analysis.pestle.environmental);
        }

        // Check if need new page
        if (this.currentY > this.pageHeight - 60) {
            doc.addPage();
            this.currentY = this.margin;
        }

        // Porter's Five Forces
        if (analysis.porter) {
            this.addSectionHeader(doc, "Porter's Five Forces");

            this.addSubsectionHeader(doc, 'Vyjednávací síla dodavatelů');
            this.addWrappedText(doc, analysis.porter.suppliers);

            this.addSubsectionHeader(doc, 'Vyjednávací síla zákazníků');
            this.addWrappedText(doc, analysis.porter.buyers);

            this.addSubsectionHeader(doc, 'Hrozba nových konkurentů');
            this.addWrappedText(doc, analysis.porter.newEntrants);

            this.addSubsectionHeader(doc, 'Hrozba substitutů');
            this.addWrappedText(doc, analysis.porter.substitutes);

            this.addSubsectionHeader(doc, 'Rivalita v odvětví');
            this.addWrappedText(doc, analysis.porter.rivalry);
        }

        // Sales Opportunities
        if (analysis.opportunities) {
            // Check if need new page
            if (this.currentY > this.pageHeight - 60) {
                doc.addPage();
                this.currentY = this.margin;
            }

            this.addSectionHeader(doc, 'Sales Opportunities pro Etnetera Group');

            if (analysis.opportunities.digitalGaps) {
                this.addSubsectionHeader(doc, 'Digitální mezery a slabiny');
                this.addWrappedText(doc, analysis.opportunities.digitalGaps);
            }

            if (analysis.opportunities.techStack) {
                this.addSubsectionHeader(doc, 'Technologický stack a modernizace');
                this.addWrappedText(doc, analysis.opportunities.techStack);
            }

            if (analysis.opportunities.growthChallenges) {
                this.addSubsectionHeader(doc, 'Výzvy růstu');
                this.addWrappedText(doc, analysis.opportunities.growthChallenges);
            }

            if (analysis.opportunities.procurementInsights) {
                this.addSubsectionHeader(doc, 'Veřejné zakázky a výběrová řízení');
                this.addWrappedText(doc, analysis.opportunities.procurementInsights);
            }

            if (analysis.opportunities.salesPitch) {
                this.addSubsectionHeader(doc, 'Sales Pitch - Jak je oslovit');
                this.addWrappedText(doc, analysis.opportunities.salesPitch);
            }
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Strana ${i} z ${pageCount} | Vygenerováno ${new Date().toLocaleDateString('cs-CZ')} | AnalyzoBot by Jan Maier`,
                this.pageWidth / 2,
                this.pageHeight - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        const fileName = `analyza_${companyData.ico}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }

    /**
     * Add title to PDF
     */
    addTitle(doc, text) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(text, this.margin, this.currentY);
        this.currentY += 10;
    }

    /**
     * Add section header
     */
    addSectionHeader(doc, text) {
        // Check if need new page
        if (this.currentY > this.pageHeight - 40) {
            doc.addPage();
            this.currentY = this.margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text(text, this.margin, this.currentY);
        this.currentY += 8;
    }

    /**
     * Add subsection header
     */
    addSubsectionHeader(doc, text) {
        // Check if need new page
        if (this.currentY > this.pageHeight - 30) {
            doc.addPage();
            this.currentY = this.margin;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(text, this.margin, this.currentY);
        this.currentY += 6;
    }

    /**
     * Add regular text
     */
    addText(doc, text) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(text, this.margin, this.currentY);
        this.currentY += this.lineHeight;
    }

    /**
     * Add text with word wrapping
     */
    addWrappedText(doc, text) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        // Ensure text is a string
        if (!text) {
            text = 'N/A';
        }
        if (typeof text !== 'string') {
            text = String(text);
        }

        // Clean and split text
        const cleanText = text.replace(/\n\n+/g, '\n').trim();
        const lines = doc.splitTextToSize(cleanText, this.contentWidth);

        lines.forEach(line => {
            // Check if need new page
            if (this.currentY > this.pageHeight - 20) {
                doc.addPage();
                this.currentY = this.margin;
            }

            doc.text(line, this.margin, this.currentY);
            this.currentY += this.lineHeight;
        });

        this.currentY += 3; // Extra space after wrapped text
    }
}
