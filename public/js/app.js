/**
 * Main application file for AnalyzoBot
 */

import { APIClient } from './api.js';
import { UIManager } from './ui.js';

class AnalyzoBot {
    constructor() {
        this.api = new APIClient();
        this.ui = new UIManager();
        this.uploadedPDFs = [];
        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        const icoInput = document.getElementById('ico');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const pdfUpload = document.getElementById('pdfUpload');

        // Analyze button click
        analyzeBtn.addEventListener('click', () => {
            this.handleAnalyze();
        });

        // Enter key in input
        icoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAnalyze();
            }
        });

        // Input validation - only numbers
        icoInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // PDF upload handler
        pdfUpload.addEventListener('change', (e) => {
            this.handlePDFUpload(e.target.files);
        });
    }

    /**
     * Handle PDF file upload
     */
    handlePDFUpload(files) {
        const uploadedFilesDiv = document.getElementById('uploadedFiles');

        // Limit to 3 files
        const filesToAdd = Array.from(files).slice(0, 3 - this.uploadedPDFs.length);

        filesToAdd.forEach(file => {
            if (file.type === 'application/pdf' && this.uploadedPDFs.length < 3) {
                this.uploadedPDFs.push(file);

                // Create file item
                const fileItem = document.createElement('div');
                fileItem.className = 'uploaded-file';
                fileItem.innerHTML = `
                    <div>
                        <span class="uploaded-file-name">${file.name}</span>
                        <span class="uploaded-file-size">(${this.formatFileSize(file.size)})</span>
                    </div>
                    <button class="btn-remove" data-filename="${file.name}">Odebrat</button>
                `;

                // Remove button handler
                fileItem.querySelector('.btn-remove').addEventListener('click', () => {
                    this.removePDF(file.name);
                });

                uploadedFilesDiv.appendChild(fileItem);
            }
        });

        // Clear input
        document.getElementById('pdfUpload').value = '';
    }

    /**
     * Remove uploaded PDF
     */
    removePDF(filename) {
        this.uploadedPDFs = this.uploadedPDFs.filter(f => f.name !== filename);

        // Re-render uploaded files
        const uploadedFilesDiv = document.getElementById('uploadedFiles');
        uploadedFilesDiv.innerHTML = '';

        this.uploadedPDFs.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file';
            fileItem.innerHTML = `
                <div>
                    <span class="uploaded-file-name">${file.name}</span>
                    <span class="uploaded-file-size">(${this.formatFileSize(file.size)})</span>
                </div>
                <button class="btn-remove" data-filename="${file.name}">Odebrat</button>
            `;

            fileItem.querySelector('.btn-remove').addEventListener('click', () => {
                this.removePDF(file.name);
            });

            uploadedFilesDiv.appendChild(fileItem);
        });
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    /**
     * Handle analyze action
     */
    async handleAnalyze() {
        const icoInput = document.getElementById('ico');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const ico = icoInput.value.trim();

        // Validation
        if (!ico) {
            this.ui.showError('Prosím zadejte IČO');
            return;
        }

        if (ico.length !== 8) {
            this.ui.showError('IČO musí mít 8 číslic');
            return;
        }

        // Disable button during analysis
        analyzeBtn.disabled = true;
        icoInput.disabled = true;

        try {
            // Show loading
            this.ui.showLoading();

            // Perform analysis with uploaded PDFs
            const results = await this.api.analyzeCompany(ico, (progress) => {
                this.ui.updateProgress(progress);
            }, this.uploadedPDFs);

            // Display results
            this.ui.displayResults(results);

        } catch (error) {
            console.error('Analysis error:', error);
            this.ui.showError(error.message || 'Nastala chyba při analýze. Zkuste to prosím znovu.');
        } finally {
            // Re-enable button
            analyzeBtn.disabled = false;
            icoInput.disabled = false;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AnalyzoBot();
});
