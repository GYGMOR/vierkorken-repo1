// Test KLARA Categories API
const https = require('https');

const apiKey = '01c11c3e-c484-4ce7-bca0-3f52eb3772af';
const url = 'https://api.klara.ch/core/latest/article-categories?limit=1000';

const options = {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'Accept-Language': 'de',
    'X-API-KEY': apiKey
  }
};

console.log('🔍 Testing KLARA Categories API...');
console.log('URL:', url);

https.get(url, options, (res) => {
  console.log('Status:', res.statusCode);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ SUCCESS! KLARA Categories Response:');
      console.log('Number of categories:', parsed.length);
      console.log('\nAll categories:');
      parsed.forEach((cat, idx) => {
        console.log(`${idx + 1}. ${cat.nameDE || cat.nameEN} (ID: ${cat.id})`);
      });
    } catch (error) {
      console.log('\n❌ ERROR parsing response:');
      console.log(data.substring(0, 500));
    }
  });
}).on('error', (error) => {
  console.error('❌ HTTPS Error:', error.message);
});
