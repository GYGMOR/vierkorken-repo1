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
  'src/app/api/admin/events/[id]/route.ts',
  'src/app/api/events/[slug]/route.ts',
  'src/app/api/user/addresses/[id]/route.ts',
  'src/app/api/tickets/[id]/wallet/route.ts',
  'src/app/api/wines/[slug]/route.ts',
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skip: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Step 1: Update type definition from { params: { xxx: string } } to Promise
  content = content.replace(
    /\{\s*params\s*\}:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g,
    '{ params }: { params: Promise<{$1}> }'
  );

  // Step 2: Extract param names and add await at function start
  const paramMatches = [...content.matchAll(/params:\s*Promise<\{\s*(\w+):\s*string(?:;\s*(\w+):\s*string)?\s*\}>/g)];

  paramMatches.forEach(match => {
    const param1 = match[1];
    const param2 = match[2];
    const params = param2 ? `${param1}, ${param2}` : param1;

    // Find all function declarations in the file
    const functionRegex = /(export\s+async\s+function\s+(?:GET|POST|PATCH|PUT|DELETE)\s*\([^)]*\)\s*\{)(\s*)/g;

    content = content.replace(functionRegex, (fullMatch, funcStart, whitespace) => {
      // Check if this function already has await params
      const nextLines = content.slice(content.indexOf(fullMatch)).split('\n').slice(1, 3).join('\n');
      if (nextLines.includes(`const { ${param1} } = await params`)) {
        return fullMatch;
      }
      return `${funcStart}\n  const { ${params} } = await params;${whitespace}`;
    });

    // Step 3: Replace params.xxx with just xxx
    if (param1) {
      content = content.replace(new RegExp(`params\\.${param1}\\b`, 'g'), param1);
    }
    if (param2) {
      content = content.replace(new RegExp(`params\\.${param2}\\b`, 'g'), param2);
    }
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes: ${filePath}`);
  }
});

console.log('\n✨ All done!');
