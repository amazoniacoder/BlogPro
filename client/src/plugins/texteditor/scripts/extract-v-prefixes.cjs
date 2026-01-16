const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid в- prefixes
const vPrefixes = ['ва', 'ве', 'ви', 'вл', 'во', 'вр', 'ву', 'вы', 'вэ', 'вю', 'вя'];

console.log('Extracting words with в- prefixes...');

const vDictPath = path.join(partitionsDir, 'ru_в.txt');
if (!fs.existsSync(vDictPath)) {
  console.error('Main в dictionary not found!');
  process.exit(1);
}

const vWords = fs.readFileSync(vDictPath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);

console.log(`Found ${vWords.length} words starting with в`);

const prefixGroups = {};
vPrefixes.forEach(prefix => prefixGroups[prefix] = []);

vWords.forEach(word => {
  if (word.length >= 2) {
    const prefix = word.substring(0, 2);
    if (prefixGroups[prefix]) {
      prefixGroups[prefix].push(word);
    }
  }
});

vPrefixes.forEach(prefix => {
  const words = prefixGroups[prefix];
  const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
  
  if (words.length > 0) {
    fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
    console.log(`${prefix}: ${words.length} words`);
  } else {
    console.log(`${prefix}: 0 words (keeping empty file)`);
  }
});

console.log('в- prefix extraction complete!');