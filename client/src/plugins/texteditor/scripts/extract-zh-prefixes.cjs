const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid ж- prefixes
const zhPrefixes = ['жа', 'же', 'жи', 'жо', 'жу', 'жы'];

console.log('Extracting words with ж- prefixes...');

const zhDictPath = path.join(partitionsDir, 'ru_ж.txt');
if (!fs.existsSync(zhDictPath)) {
  console.error('Main ж dictionary not found!');
  process.exit(1);
}

const zhWords = fs.readFileSync(zhDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${zhWords.length} words starting with ж`);

const prefixGroups = {};
zhPrefixes.forEach(prefix => prefixGroups[prefix] = []);

zhWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

zhPrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('ж- prefix extraction complete!');