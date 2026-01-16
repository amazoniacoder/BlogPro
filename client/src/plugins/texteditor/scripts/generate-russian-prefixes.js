const fs = require('fs');
const path = require('path');

const rareDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Russian alphabet
const russianLetters = [
  'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'
];

// Generate all two-letter combinations
const combinations = [];
for (const first of russianLetters) {
  for (const second of russianLetters) {
    combinations.push(first + second);
  }
}

// Sort combinations alphabetically
combinations.sort();

// Create files starting from 'ба' (skip existing 'а*' combinations)
const startIndex = combinations.indexOf('ба');
const missingCombinations = combinations.slice(startIndex);

console.log(`Creating ${missingCombinations.length} prefix files starting from 'ба'...`);

missingCombinations.forEach(combo => {
  const filename = `ru_${combo}.txt`;
  const filepath = path.join(rareDir, filename);
  
  // Only create if file doesn't exist
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '', 'utf8');
    console.log(`Created: ${filename}`);
  } else {
    console.log(`Exists: ${filename}`);
  }
});

console.log('Prefix file generation complete!');