const fs = require('fs');
const file = 'src/lib/email.ts';
let content = fs.readFileSync(file, 'utf8');

const metaTags = `<meta name="color-scheme" content="light">\n            <meta name="supported-color-schemes" content="light">`;

content = content.replace(/<head>([\s\S]*?)<\/head>/g, `<head>\n            ${metaTags}$1</head>`);

fs.writeFileSync(file, content);
console.log('Done replacing tags in email.ts');
