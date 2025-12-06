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

  // Remove duplicate await params lines
  // Pattern: multiple consecutive identical await params lines
  content = content.replace(/(const \{ (\w+)(?:, (\w+))? \} = await params;)\s*\1+/g, '$1');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Removed duplicates: ${filePath}`);
  } else {
    console.log(`ℹ️  No duplicates: ${filePath}`);
  }
});

console.log('\n✨ Done!');
