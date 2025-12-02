// Test KLARA API directly
const KLARA_API_URL = 'https://api.klara.ch';
const KLARA_API_KEY = '01c11c3e-c484-4ce7-bca0-3f52eb3772af';

async function testKlaraAPI() {
  console.log('🧪 Testing KLARA API...\n');

  // Test Articles
  console.log('📦 Testing /articles endpoint...');
  try {
    const articlesUrl = `${KLARA_API_URL}/core/latest/articles?limit=10`;
    console.log('URL:', articlesUrl);

    const articlesResponse = await fetch(articlesUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'de',
        'X-API-KEY': KLARA_API_KEY,
      },
    });

    console.log('Articles Status:', articlesResponse.status, articlesResponse.statusText);

    if (!articlesResponse.ok) {
      const errorText = await articlesResponse.text();
      console.error('❌ Articles Error:', errorText);
    } else {
      const articlesData = await articlesResponse.json();
      console.log('✅ Articles Count:', articlesData.length);
      if (articlesData.length > 0) {
        console.log('Sample Article:', JSON.stringify(articlesData[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Articles Exception:', error.message);
  }

  console.log('\n📂 Testing /categories endpoint...');
  try {
    const categoriesUrl = `${KLARA_API_URL}/core/latest/pos-categories?limit=100`;
    console.log('URL:', categoriesUrl);

    const categoriesResponse = await fetch(categoriesUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'de',
        'X-API-KEY': KLARA_API_KEY,
      },
    });

    console.log('Categories Status:', categoriesResponse.status, categoriesResponse.statusText);

    if (!categoriesResponse.ok) {
      const errorText = await categoriesResponse.text();
      console.error('❌ Categories Error:', errorText);
    } else {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories Count:', categoriesData.length);
      if (categoriesData.length > 0) {
        console.log('Sample Category:', JSON.stringify(categoriesData[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Categories Exception:', error.message);
  }
}

testKlaraAPI();
