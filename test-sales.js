/**
 * Test sales-focused analysis
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testSalesAnalysis() {
    console.log('🎯 Testing Sales-Focused Analysis for Etnetera Group\n');

    try {
        // Test with Alza.cz - large e-commerce company
        console.log('Testing with: Alza.cz (IČO: 27082440)');
        console.log('─'.repeat(60));

        // Get company data
        console.log('\n1️⃣ Fetching company data...');
        const companyResponse = await axios.get(`${API_BASE}/company-data?ico=27082440`);
        const company = companyResponse.data;

        console.log(`✅ Company: ${company.name}`);
        console.log(`   Industry: ${company.industryDescription}`);
        console.log(`   Status: ${company.status}`);

        // Get sales-focused analysis
        console.log('\n2️⃣ Running sales-focused AI analysis (15-30 seconds)...');
        const analysisResponse = await axios.post(`${API_BASE}/analyze`, {
            companyData: company
        });

        const analysis = analysisResponse.data;

        console.log('\n' + '═'.repeat(60));
        console.log('📊 SALES OPPORTUNITIES ANALYSIS');
        console.log('═'.repeat(60));

        // PESTLE (sales-focused)
        console.log('\n🔍 PESTLE (Sales Focus):');
        console.log('─'.repeat(60));
        console.log('\n💼 Technological:');
        console.log(analysis.pestle.technological);

        // Porter (sales-focused)
        console.log('\n\n⚔️ PORTER (Sales Focus):');
        console.log('─'.repeat(60));
        console.log('\n🤝 IT Dependencies:');
        console.log(analysis.porter.suppliers);

        // Opportunities - The KEY section!
        if (analysis.opportunities) {
            console.log('\n\n🎯 SALES OPPORTUNITIES:');
            console.log('═'.repeat(60));

            console.log('\n🔍 Digital Gaps:');
            console.log('─'.repeat(60));
            console.log(analysis.opportunities.digitalGaps);

            console.log('\n\n💻 Tech Stack Assessment:');
            console.log('─'.repeat(60));
            console.log(analysis.opportunities.techStack);

            console.log('\n\n📈 Growth Challenges:');
            console.log('─'.repeat(60));
            console.log(analysis.opportunities.growthChallenges);

            console.log('\n\n💡 SALES PITCH:');
            console.log('═'.repeat(60));
            console.log(analysis.opportunities.salesPitch);
            console.log('═'.repeat(60));
        } else {
            console.log('\n⚠️ No opportunities section found!');
        }

        console.log('\n\n🎉 Analysis complete!');
        console.log('\n👉 Open http://localhost:3000 and enter IČO: 27082440 to see the full UI');

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);

        if (error.response?.status === 500) {
            console.log('\n💡 Possible issues:');
            console.log('   - Check API key in .env');
            console.log('   - Make sure server is running');
            console.log('   - Check server logs for details');
        }
    }
}

testSalesAnalysis();
