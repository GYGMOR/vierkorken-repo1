const fs = require('fs');

const file = 'c:/Users/Joel.Hediger/Downloads/vierkorken-repo1-dev/vierkorken-repo1-dev/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add sections state
content = content.replace(
    'const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);',
    `const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch('/api/homepage-sections');
        const data = await res.json();
        if (data.success) {
          setSections(data.sections || []);
        }
      } catch (error) {
        console.error('Error fetching homepage sections:', error);
      }
    }
    fetchSections();
  }, []);`
);

// 2. Extract sections into a rendering map.
const featuresSectionRegex = /\{\/\* Features Section \*\/\}([\s\S]*?)\{\/\* News Section \*\/\}/;
const featuresMatch = content.match(featuresSectionRegex);
const featuresSectionCode = featuresMatch ? featuresMatch[0].replace('{/* News Section */}', '').trim() : '';

const newsSectionRegex = /\{\/\* News Section \*\/\}([\s\S]*?)\{\/\* Account Creation Modal \*\/\}/;
const newsMatch = content.match(newsSectionRegex);
const newsSectionCode = newsMatch ? newsMatch[0].replace('{/* Account Creation Modal */}', '').trim() : '';

const newProductsRegex = /\{\/\* New Products Carousel \*\/\}([\s\S]*?)\{\/\* Discounted Products Carousel \*\/\}/;
const newProductsMatch = content.match(newProductsRegex);
const newProductsSectionCode = newProductsMatch ? newProductsMatch[0].replace('{/* Discounted Products Carousel */}', '').trim() : '';

const discountedProductsRegex = /\{\/\* Discounted Products Carousel \*\/\}([\s\S]*?)\{\/\* Wine Types \*\/\}/;
const discountMatch = content.match(discountedProductsRegex);
const discountedSectionCode = discountMatch ? discountMatch[0].replace('{/* Wine Types */}', '').trim() : '';

const loyaltyEndRegex = /\{\/\* Loyalty Preview \*\/\}([\s\S]*?)<\/MainLayout>/;
const loyaltyMatch = content.match(loyaltyEndRegex);
const loyaltySectionCode = loyaltyMatch ? '<section class' + loyaltyMatch[1].split('<section class')[1].trim() : '';

const wineTypesRegex = /\{\/\* Wine Types \*\/\}([\s\S]*?)\{\/\* Loyalty Preview \*\/\}/;
const wineMatch = content.match(wineTypesRegex);
let wineTypesSectionCode = wineMatch ? wineMatch[1].trim() : '';

const giftCardsSplitRegex = /\{\/\* Gift Cards & Divers Section \*\/\}/;
let categoriesSectionCode = '';
let giftCardsSectionCode = '';

if (wineTypesSectionCode) {
    const parts = wineTypesSectionCode.split(giftCardsSplitRegex);
    categoriesSectionCode = parts[0] + '\n        </div>\n      </section>';
    giftCardsSectionCode = `      <section className="section-padding bg-warmwhite-light">\n        <div className="container-custom">\n          {/* Gift Cards & Divers Section */}\n` + parts[1].trim();
}

const renderFunctionCode = `
  const renderSection = (section: any) => {
    if (!section.isVisible) return null;

    switch (section.identifier) {
      case 'new-arrivals':
        return (
          <div key={section.identifier}>
            ${newProductsSectionCode}
          </div>
        );
      case 'news':
        return (
          <div key={section.identifier}>
            ${newsSectionCode}
          </div>
        );
      case 'categories':
        return (
          <div key={section.identifier}>
            {/* Wine Types */}
            ${categoriesSectionCode}
          </div>
        );
      case 'discounted':
        return (
          <div key={section.identifier}>
            ${discountedSectionCode}
          </div>
        );
      case 'loyalty':
        return (
          <div key={section.identifier}>
            {/* Loyalty Preview */}
            ${loyaltySectionCode}
          </div>
        );
      case 'gift-cards':
        return (
          <div key={section.identifier}>
            ${giftCardsSectionCode}
          </div>
        );
      default:
        return null;
    }
  };
`;

const allSectionsRegex = /\{\/\* Features Section \*\/\}[\s\S]*<\/MainLayout>/;

const newRenderStructure = `
      {/* Features Section */}
      ${featuresSectionCode}

      {/* Dynamic Sections */}
      {sections.length > 0 ? sections.map(renderSection) : (
        <>
          {/* Fallback to original layout before sections load/if empty */}
          ${newProductsSectionCode}
          ${newsSectionCode}
          {/* Wine Types */}
          ${categoriesSectionCode}
          ${discountedSectionCode}
          {/* Loyalty Preview */}
          ${loyaltySectionCode}
          ${giftCardsSectionCode}
        </>
      )}

      {/* Account Creation Modal */}
      {showAccountModal && (
        <AccountCreationModal
          email={newsletterEmail}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </MainLayout>
`;

let newContent = content.replace(allSectionsRegex, newRenderStructure);
newContent = newContent.replace('return (', renderFunctionCode + '\n  return (');

fs.writeFileSync(file, newContent, 'utf8');
console.log('Successfully refactored page.tsx');
