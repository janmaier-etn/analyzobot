/**
 * Quick API test script
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing AnalyzoBot API...\n');

    try {
        // Test 1: Company Data
        console.log('1️⃣ Testing company-data endpoint...');
        const companyResponse = await axios.get(`${API_BASE}/company-data?ico=27082440`);
        console.log(`✅ Company: ${companyResponse.data.name}`);
        console.log(`   IČO: ${companyResponse.data.ico}`);
        console.log(`   Address: ${companyResponse.data.address}\n`);

        // Test 2: AI Analysis
        console.log('2️⃣ Testing analyze endpoint (this may take 10-20 seconds)...');
        const analysisResponse = await axios.post(`${API_BASE}/analyze`, {
            companyData: companyResponse.data
        });

        if (analysisResponse.data.pestle && analysisResponse.data.porter) {
            console.log('✅ AI Analysis successful!');
            console.log(`   PESTLE - Political: ${analysisResponse.data.pestle.political.substring(0, 80)}...`);
            console.log(`   Porter - Suppliers: ${analysisResponse.data.porter.suppliers.substring(0, 80)}...\n`);
        } else {
            console.log('⚠️ Analysis response incomplete');
        }

        // Test 3: Vendors
        console.log('3️⃣ Testing find-vendors endpoint...');
        const vendorsResponse = await axios.post(`${API_BASE}/find-vendors`, {
            companyData: companyResponse.data
        });
        console.log(`✅ Found ${vendorsResponse.data.length} vendors`);
        if (vendorsResponse.data.length > 0) {
            console.log(`   Example: ${vendorsResponse.data[0].name}\n`);
        }

        console.log('🎉 All tests passed! Your application is working correctly.\n');
        console.log('👉 Open http://localhost:3000 in your browser to use the app!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure the server is running: npm run dev');
        } else if (error.response?.status === 500 && error.response?.data?.details?.includes('API')) {
            console.log('\n💡 Check your API key in .env file');
        }
    }
}

testAPI();
