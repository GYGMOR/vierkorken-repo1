const https = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

// Create self-signed certificate if it doesn't exist
const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'localhost-key.pem');
const certPath = path.join(certDir, 'localhost.pem');

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

// Generate self-signed certificate using Node.js crypto
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('Generating self-signed certificate...');
  const { execSync } = require('child_process');

  try {
    // Try using openssl (if available on Windows via Git Bash or similar)
    execSync(
      `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" ` +
      `-keyout "${keyPath}" -out "${certPath}" -days 365`,
      { stdio: 'inherit' }
    );
    console.log('✓ Certificate generated successfully');
  } catch (error) {
    console.error('OpenSSL not found. Please install OpenSSL or use HTTP instead.');
    process.exit(1);
  }
}

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
    console.log(`> Local: https://localhost:${port}`);
    console.log(`> Network: https://10.100.122.186:${port}`);
    console.log('\n⚠️  You will need to accept the self-signed certificate in your browser');
  });
});
