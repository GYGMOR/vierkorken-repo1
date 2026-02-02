/**
 * KLARA Product Import Script
 *
 * Imports products from KLARA Excel export into the database
 *
 * Usage: npx tsx scripts/import-klara-products.ts
 */

import { importFromKlaraExcel } from '../src/lib/klara/excel-importer';

async function main() {
  console.log('🚀 Starting KLARA Product Import...\n');

  const result = await importFromKlaraExcel();

  if (result.success) {
    console.log('\n✅ Import Completed Successfully!\n');
    console.log('📊 Statistics:');
    console.log(`  Total Products: ${result.stats.total}`);
    console.log(`  ✅ Created: ${result.stats.created}`);
    console.log(`  🔄 Updated: ${result.stats.updated}`);
    console.log(`  ❌ Errors: ${result.stats.errors}`);
  } else {
    console.error('\n❌ Import Failed:', result.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
