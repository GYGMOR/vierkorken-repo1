// Test KLARA API Connection
const https = require('https');

const apiKey = '01c11c3e-c484-4ce7-bca0-3f52eb3772af';
const url = 'https://api.klara.ch/core/latest/articles?limit=1000';

const options = {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'Accept-Language': 'de',
    'X-API-KEY': apiKey
  }
};

console.log('🔍 Testing KLARA API...');
console.log('URL:', url);

https.get(url, options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ SUCCESS! KLARA API Response:');
      console.log('Number of articles:', parsed.length);
      if (parsed.length > 0) {
        console.log('\nFirst article:');
        console.log('- ID:', parsed[0].id);
        console.log('- Name:', parsed[0].nameDE || parsed[0].nameEN);
        console.log('- Article Number:', parsed[0].articleNumber);
        console.log('- Price:', parsed[0].pricePeriods?.[0]?.price || 'N/A');
      }
    } catch (error) {
      console.log('\n❌ ERROR parsing response:');
      console.log(data.substring(0, 500));
    }
  });
}).on('error', (error) => {
  console.error('❌ HTTPS Error:', error.message);
});
