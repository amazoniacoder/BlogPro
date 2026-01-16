const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid б- prefixes
const bPrefixes = ['ба', 'бе', 'би', 'бл', 'бо', 'бр', 'бу', 'бы', 'бэ', 'бю', 'бя'];

console.log('Extracting words with б- prefixes...');

// Read the main б dictionary
const bDictPath = path.join(partitionsDir, 'ru_б.txt');
if (!fs.existsSync(bDictPath)) {
  console.error('Main б dictionary not found!');
  process.exit(1);
}

const bWords = fs.readFileSync(bDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${bWords.length} words starting with б`);

// Group words by prefix
const prefixGroups = {};
bPrefixes.forEach(prefix => prefixGroups[prefix] = []);

bWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

// Write to prefix files
bPrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('б- prefix extraction complete!');