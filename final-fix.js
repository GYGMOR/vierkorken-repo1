const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/orders/[id]/confirm/route.ts',
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/reviews/[id]/route.ts',
  'src/app/api/admin/klara/override/[id]/route.ts',
  'src/app/api/admin/orders/[id]/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/orders/[id]/invoice/route.ts',
  'src/app/api/admin/wines/[id]/variants/[variantId]/route.ts',
  'src/app/api/admin/wines/[id]/variants/route.ts',
  'src/app/api/admin/wines/[id]/images/[imageId]/route.ts',
  'src/app/api/admin/wines/[id]/images/route.ts',
  'src/app/api/admin/wines/[id]/route.ts',
  'src/app/api/events/[slug]/route.ts',
  'src/app/api/user/addresses/[id]/route.ts',
  'src/app/api/tickets/[id]/wallet/route.ts',
  'src/app/api/wines/[slug]/route.ts',
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const result = [];
  const seenInFunction = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function start
    if (line.match(/export async function (GET|POST|PATCH|PUT|DELETE)/)) {
      seenInFunction.clear();
    }

    // Check if this is an await params line
    const awaitMatch = line.match(/^\s*const \{ (.+) \} = await params;/);

    if (awaitMatch) {
      const vars = awaitMatch[1];
      if (!seenInFunction.has(vars)) {
        seenInFunction.add(vars);
        result.push(line);
      }
      // Skip this line if we've already seen it in this function
    } else {
      result.push(line);
    }
  }

  const newContent = result.join('\n');

  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ ${filePath}`);
  }
});

console.log('\n✨ All clean!');
