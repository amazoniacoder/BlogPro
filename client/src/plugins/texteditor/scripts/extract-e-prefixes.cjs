const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid е- prefixes
const ePrefixes = ['ев', 'ег', 'ед', 'ез', 'ек', 'ел', 'ем', 'ен', 'ер', 'ес', 'еф'];

console.log('Extracting words with е- prefixes...');

const eDictPath = path.join(partitionsDir, 'ru_е.txt');
if (!fs.existsSync(eDictPath)) {
  console.error('Main е dictionary not found!');
  process.exit(1);
}

const eWords = fs.readFileSync(eDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${eWords.length} words starting with е`);

const prefixGroups = {};
ePrefixes.forEach(prefix => prefixGroups[prefix] = []);

eWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

ePrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('е- prefix extraction complete!');