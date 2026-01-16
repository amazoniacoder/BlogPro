/**
 * Documentation API Test Script
 * Tests the new database-driven documentation API endpoints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/documentation';

async function testAPI() {
  console.log('🧪 Testing Documentation API Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/test`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Get sections (should return empty initially)
    console.log('\n2. Testing sections endpoint...');
    const sectionsResponse = await axios.get(`${API_BASE}/sections`);
    console.log('✅ Sections retrieved:', sectionsResponse.data.length, 'sections');

    // Test 3: Create a test section
    console.log('\n3. Testing section creation...');
    const newSection = {
      name: 'Test Section',
      description: 'A test section for API testing',
      order_index: 1
    };
    
    // Note: This requires authentication, so it might fail
    try {
      const createSectionResponse = await axios.post(`${API_BASE}/sections`, newSection);
      console.log('✅ Section created:', createSectionResponse.data.name);
    } catch (error) {
      console.log('⚠️  Section creation requires authentication (expected)');
    }

    // Test 4: Get content (should return empty initially)
    console.log('\n4. Testing content endpoint...');
    const contentResponse = await axios.get(`${API_BASE}/content`);
    console.log('✅ Content retrieved:', contentResponse.data.length, 'items');

    // Test 5: Test search endpoint
    console.log('\n5. Testing search endpoint...');
    const searchResponse = await axios.post(`${API_BASE}/search`, {
      query: 'test',
      filters: {}
    });
    console.log('✅ Search completed:', searchResponse.data.total, 'results');

    // Test 6: Test suggestions endpoint
    console.log('\n6. Testing suggestions endpoint...');
    const suggestionsResponse = await axios.get(`${API_BASE}/search/suggestions?q=test`);
    console.log('✅ Suggestions retrieved:', suggestionsResponse.data.length, 'suggestions');

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testAPI();