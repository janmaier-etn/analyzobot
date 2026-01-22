/**
 * UI Manager for AnalyzoBot
 * Handles all DOM manipulation and UI updates
 */

export class UIManager {
    constructor() {
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorText: document.getElementById('errorText'),
            results: document.getElementById('results'),
            loadingText: document.getElementById('loadingText'),
            // Progress steps
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3'),
            step4: document.getElementById('step4'),
            // Company info
            companyName: document.getElementById('companyName'),
            companyIco: document.getElementById('companyIco'),
            companyAddress: document.getElementById('companyAddress'),
            companyLegalForm: document.getElementById('companyLegalForm'),
            companyStatus: document.getElementById('companyStatus'),
            // PESTLE
            pestlePolitical: document.getElementById('pestlePolitical'),
            pestleEconomic: document.getElementById('pestleEconomic'),
            pestleSocial: document.getElementById('pestleSocial'),
            pestleTechnological: document.getElementById('pestleTechnological'),
            pestleLegal: document.getElementById('pestleLegal'),
            pestleEnvironmental: document.getElementById('pestleEnvironmental'),
            // Porter
            porterSuppliers: document.getElementById('porterSuppliers'),
            porterBuyers: document.getElementById('porterBuyers'),
            porterNewEntrants: document.getElementById('porterNewEntrants'),
            porterSubstitutes: document.getElementById('porterSubstitutes'),
            porterRivalry: document.getElementById('porterRivalry'),
            // Opportunities
            digitalGaps: document.getElementById('digitalGaps'),
            techStack: document.getElementById('techStack'),
            growthChallenges: document.getElementById('growthChallenges'),
            salesPitch: document.getElementById('salesPitch')
        };
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.error.classList.add('hidden');
        this.elements.results.classList.add('hidden');
        this.resetProgressSteps();
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    /**
     * Update loading progress
     * @param {Object} progress - Progress info {step, message}
     */
    updateProgress(progress) {
        this.elements.loadingText.textContent = progress.message;

        const steps = [this.elements.step1, this.elements.step2, this.elements.step3, this.elements.step4];

        steps.forEach((stepEl, index) => {
            if (index < progress.step - 1) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (index === progress.step - 1) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
    }

    /**
     * Reset progress steps
     */
    resetProgressSteps() {
        [this.elements.step1, this.elements.step2, this.elements.step3, this.elements.step4].forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.elements.error.classList.remove('hidden');
        this.elements.errorText.textContent = message;
        this.elements.loading.classList.add('hidden');
        this.elements.results.classList.add('hidden');
    }

    /**
     * Display analysis results
     * @param {Object} data - Analysis data
     */
    displayResults(data) {
        this.hideLoading();
        this.elements.error.classList.add('hidden');
        this.elements.results.classList.remove('hidden');

        // Populate company info
        this.displayCompanyInfo(data.company);

        // Populate PESTLE analysis
        this.displayPESTLEAnalysis(data.analysis.pestle);

        // Populate Porter analysis
        this.displayPorterAnalysis(data.analysis.porter);

        // Populate opportunities
        this.displayOpportunities(data.analysis.opportunities || {});

        // Scroll to results
        this.elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Display company information
     * @param {Object} company - Company data
     */
    displayCompanyInfo(company) {
        this.elements.companyName.textContent = company.name || 'N/A';
        this.elements.companyIco.textContent = company.ico || 'N/A';
        this.elements.companyAddress.textContent = company.address || 'N/A';
        this.elements.companyLegalForm.textContent = company.legalForm || 'N/A';
        this.elements.companyStatus.textContent = company.status || 'N/A';
    }

    /**
     * Display PESTLE analysis
     * @param {Object} pestle - PESTLE analysis data
     */
    displayPESTLEAnalysis(pestle) {
        this.elements.pestlePolitical.textContent = pestle.political || 'Žádné údaje';
        this.elements.pestleEconomic.textContent = pestle.economic || 'Žádné údaje';
        this.elements.pestleSocial.textContent = pestle.social || 'Žádné údaje';
        this.elements.pestleTechnological.textContent = pestle.technological || 'Žádné údaje';
        this.elements.pestleLegal.textContent = pestle.legal || 'Žádné údaje';
        this.elements.pestleEnvironmental.textContent = pestle.environmental || 'Žádné údaje';
    }

    /**
     * Display Porter analysis
     * @param {Object} porter - Porter analysis data
     */
    displayPorterAnalysis(porter) {
        this.elements.porterSuppliers.textContent = porter.suppliers || 'Žádné údaje';
        this.elements.porterBuyers.textContent = porter.buyers || 'Žádné údaje';
        this.elements.porterNewEntrants.textContent = porter.newEntrants || 'Žádné údaje';
        this.elements.porterSubstitutes.textContent = porter.substitutes || 'Žádné údaje';
        this.elements.porterRivalry.textContent = porter.rivalry || 'Žádné údaje';
    }

    /**
     * Display sales opportunities
     * @param {Object} opportunities - Opportunities data
     */
    displayOpportunities(opportunities) {
        this.elements.digitalGaps.textContent = opportunities.digitalGaps || 'Žádné údaje';
        this.elements.techStack.textContent = opportunities.techStack || 'Žádné údaje';
        this.elements.growthChallenges.textContent = opportunities.growthChallenges || 'Žádné údaje';
        this.elements.salesPitch.textContent = opportunities.salesPitch || 'Žádné údaje';
    }
}
