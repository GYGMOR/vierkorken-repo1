const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Try to load SSL certificates
  let httpsOptions;

  try {
    // For Ubuntu default self-signed cert
    httpsOptions = {
      key: fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key'),
      cert: fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem'),
    };
    console.log('✅ Using system self-signed certificate');
  } catch (err) {
    console.error('❌ Could not load SSL certificates:', err.message);
    console.log('📝 Please generate certificates first with:');
    console.log('   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\');
    console.log('     -keyout /etc/ssl/private/ssl-cert-snakeoil.key \\');
    console.log('     -out /etc/ssl/certs/ssl-cert-snakeoil.pem');
    process.exit(1);
  }

  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log('');
      console.log('🚀 HTTPS Server läuft!');
      console.log(`   https://192.168.1.100:${port}`);
      console.log(`   https://localhost:${port}`);
      console.log('');
      console.log('⚠️  Browser wird Sicherheitswarnung zeigen (selbst-signiertes Zertifikat)');
      console.log('   → Klicke "Erweitert" → "Trotzdem fortfahren"');
      console.log('');
    });
});
