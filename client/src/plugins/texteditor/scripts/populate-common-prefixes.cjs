const fs = require('fs');
const path = require('path');

const rareDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');
const commonDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'common');

// Common prefixes that exist in common directory
const commonPrefixes = ['бо', 'во', 'го', 'до', 'за', 'ко', 'ло', 'мо', 'на', 'не', 'но', 'об', 'от', 'по', 'пр', 'ро', 'со', 'то', 'фо', 'хо'];

console.log('Populating common prefix files...');

commonPrefixes.forEach(prefix => {
  const rareFile = path.join(rareDir, `ru_${prefix}.txt`);
  const commonFile = path.join(commonDir, `ru_${prefix}.txt`);
  
  if (!fs.existsSync(rareFile)) {
    console.log(`${prefix}: rare file not found, skipping`);
    return;
  }
  
  const words = fs.readFileSync(rareFile, 'utf8')
    .split('\n')
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  if (words.length === 0) {
    console.log(`${prefix}: no words found`);
    return;
  }
  
  // Take first 1000 most common words (they're already sorted by frequency)
  const commonWords = words.slice(0, 1000);
  
  const content = `# Частые слова с префиксом "${prefix}"\n${commonWords.join('\n')}\n`;
  
  fs.writeFileSync(commonFile, content, 'utf8');
  console.log(`${prefix}: ${commonWords.length} words`);
});

console.log('Common prefix population complete!');