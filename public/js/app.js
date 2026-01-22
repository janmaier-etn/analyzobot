/**
 * Main application file for AnalyzoBot
 */

import { APIClient } from './api.js';
import { UIManager } from './ui.js';

class AnalyzoBot {
    constructor() {
        this.api = new APIClient();
        this.ui = new UIManager();
        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        const icoInput = document.getElementById('ico');
        const analyzeBtn = document.getElementById('analyzeBtn');

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

            // Perform analysis
            const results = await this.api.analyzeCompany(ico, (progress) => {
                this.ui.updateProgress(progress);
            });

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
