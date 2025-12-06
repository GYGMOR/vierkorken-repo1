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
    console.log(`⚠️  Skip: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Split into functions
  const functionStarts = [...content.matchAll(/export async function (GET|POST|PATCH|PUT|DELETE)\s*\(/g)];

  functionStarts.forEach(match => {
    const funcName = match[1];
    const funcStartIndex = match.index;

    // Find the opening brace
    const funcDefEnd = content.indexOf('{', funcStartIndex);
    const beforeBrace = content.substring(0, funcDefEnd + 1);
    const afterBrace = content.substring(funcDefEnd + 1);

    // Find the next 200 characters after brace (should contain await params if any)
    const nextChunk = afterBrace.substring(0, 300);

    // Check for multiple await params lines
    const awaitLines = nextChunk.match(/^\s*const \{ (\w+(?:, \w+)?) \} = await params;\s*\n/gm);

    if (awaitLines && awaitLines.length > 1) {
      // Keep only the first one
      const firstAwait = awaitLines[0];
      const restOfFunction = nextChunk.replace(/^\s*const \{ \w+(?:, \w+)? \} = await params;\s*\n/gm, firstAwait);
      content = beforeBrace + restOfFunction + afterBrace.substring(300);
    }
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
  } else {
    console.log(`ℹ️  OK: ${filePath}`);
  }
});

console.log('\n✨ Cleanup done!');
