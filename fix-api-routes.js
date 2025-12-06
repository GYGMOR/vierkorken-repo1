const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/orders/[id]/confirm/route.ts',
  'src/app/api/admin/coupons/[id]/route.ts',
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
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Pattern 1: { params }: { params: { id: string } }
  const pattern1 = /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*(\w+):\s*string\s*\}\s*\}/g;
  if (pattern1.test(content)) {
    content = content.replace(
      /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*(\w+):\s*string\s*\}\s*\}/g,
      '{ params }: { params: Promise<{ $1: string }> }'
    );
    modified = true;
  }

  // Pattern 2: Add await params at start of function
  const functionPattern = /(export\s+async\s+function\s+(?:GET|POST|PATCH|PUT|DELETE)\s*\([^)]*\)\s*\{)\s*/g;
  const matches = content.match(functionPattern);

  if (matches) {
    // Find param names used in this file
    const paramMatch = content.match(/params:\s*Promise<\{\s*(\w+):\s*string\s*\}>/);
    const paramMatch2 = content.match(/params:\s*Promise<\{\s*(\w+):\s*string;\s*(\w+):\s*string\s*\}>/);

    if (paramMatch2) {
      const [, param1, param2] = paramMatch2;
      content = content.replace(
        functionPattern,
        `$1\n  const { ${param1}, ${param2} } = await params;\n`
      );
      // Replace params.param1 and params.param2
      content = content.replace(new RegExp(`params\\.${param1}`, 'g'), param1);
      content = content.replace(new RegExp(`params\\.${param2}`, 'g'), param2);
      modified = true;
    } else if (paramMatch) {
      const [, paramName] = paramMatch;
      // Check if already has await params
      if (!content.includes(`const { ${paramName} } = await params`)) {
        content = content.replace(
          functionPattern,
          `$1\n  const { ${paramName} } = await params;\n`
        );
        // Replace params.paramName with just paramName
        content = content.replace(new RegExp(`params\\.${paramName}`, 'g'), paramName);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes: ${filePath}`);
  }
});

console.log('\n✨ Done!');
