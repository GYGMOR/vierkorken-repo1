const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with variant="outline"
const result = execSync('grep -rl \'variant="outline"\' src --include="*.tsx"', { encoding: 'utf8' });

const files = result.trim().split('\n').filter(Boolean);

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath.replace(/\//g, path.sep));

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skip: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace variant="outline" with variant="secondary"
  content = content.replace(/variant="outline"/g, 'variant="secondary"');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ ${filePath}`);
});

console.log(`\n✨ Fixed ${files.length} files!`);
