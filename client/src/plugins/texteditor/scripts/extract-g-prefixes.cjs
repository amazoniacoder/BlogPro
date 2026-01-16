const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid г- prefixes
const gPrefixes = ['га', 'ге', 'ги', 'гл', 'го', 'гр', 'гу', 'гы', 'гэ', 'гю', 'гя'];

console.log('Extracting words with г- prefixes...');

const gDictPath = path.join(partitionsDir, 'ru_г.txt');
if (!fs.existsSync(gDictPath)) {
  console.error('Main г dictionary not found!');
  process.exit(1);
}

const gWords = fs.readFileSync(gDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${gWords.length} words starting with г`);

const prefixGroups = {};
gPrefixes.forEach(prefix => prefixGroups[prefix] = []);

gWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

gPrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('г- prefix extraction complete!');