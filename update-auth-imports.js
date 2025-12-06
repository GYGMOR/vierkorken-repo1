const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with the old import
const result = execSync('grep -rl "from \'@/app/api/auth/\\[...nextauth\\]/route\'" src --include="*.ts" --include="*.tsx"', { encoding: 'utf8' });

const files = result.trim().split('\n').filter(Boolean);

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath.replace(/\//g, path.sep));

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skip: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace the import
  content = content.replace(
    /from '@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route'/g,
    "from '@/lib/auth-options'"
  );

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ ${filePath}`);
});

console.log(`\n✨ Updated ${files.length} files!`);
