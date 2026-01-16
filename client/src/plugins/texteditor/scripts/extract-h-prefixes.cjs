const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid х- prefixes
const hPrefixes = ['ха', 'хе', 'хи', 'хл', 'хм', 'хо', 'хр', 'ху', 'хы', 'хэ', 'хю', 'хя'];

console.log('Extracting words with х- prefixes...');

const hDictPath = path.join(partitionsDir, 'ru_х.txt');
if (!fs.existsSync(hDictPath)) {
  console.error('Main х dictionary not found!');
  process.exit(1);
}

const hWords = fs.readFileSync(hDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${hWords.length} words starting with х`);

const prefixGroups = {};
hPrefixes.forEach(prefix => prefixGroups[prefix] = []);

hWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

hPrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('х- prefix extraction complete!');