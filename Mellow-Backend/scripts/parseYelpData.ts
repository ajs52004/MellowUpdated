// parseYelpData.ts
import fs from 'fs';
import readline from 'readline';

const inputPath = 'C:/YelpDataset/yelp_academic_dataset_business.json';
const outputPath = './data/filtered_businesses.json';

const TARGET_CATEGORIES = ['bar', 'club', 'restaurant'];

async function parseYelpData() {
  const inputStream = fs.createReadStream(inputPath);
  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  const output: any[] = [];

  for await (const line of rl) {
    try {
      const business = JSON.parse(line);
      const categories = (business.categories || '').toLowerCase();

      if (TARGET_CATEGORIES.some((cat) => categories.includes(cat))) {
        output.push({
          id: business.business_id,
          name: business.name,
          address: business.address,
          city: business.city,
          state: business.state,
          latitude: business.latitude,
          longitude: business.longitude,
          stars: business.stars,
          review_count: business.review_count,
          is_open: business.is_open,
          categories: business.categories,
        });
      }
    } catch (err) {
      console.error('Invalid JSON line:', err);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Saved ${output.length} entries to filtered_businesses.json`);
}

parseYelpData();
