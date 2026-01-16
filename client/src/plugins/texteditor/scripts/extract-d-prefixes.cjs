const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid д- prefixes
const dPrefixes = ['да', 'де', 'ди', 'до', 'др', 'ду', 'ды', 'дэ', 'дю', 'дя'];

console.log('Extracting words with д- prefixes...');

const dDictPath = path.join(partitionsDir, 'ru_д.txt');
if (!fs.existsSync(dDictPath)) {
  console.error('Main д dictionary not found!');
  process.exit(1);
}

const dWords = fs.readFileSync(dDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${dWords.length} words starting with д`);

const prefixGroups = {};
dPrefixes.forEach(prefix => prefixGroups[prefix] = []);

dWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

dPrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('д- prefix extraction complete!');