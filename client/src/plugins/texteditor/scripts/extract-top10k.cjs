const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const commonDir = path.join(__dirname, '..', 'dictionaries', 'common');

console.log('Extracting top 10,000 most frequent Russian words...');

// Get all partition files
const partitionFiles = fs.readdirSync(partitionsDir)
  .filter(file => file.startsWith('ru_') && file.endsWith('.txt'))
  .sort();

let allWords = [];

partitionFiles.forEach(file => {
  const filePath = path.join(partitionsDir, file);
  const words = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  allWords = allWords.concat(words);
  console.log(`${file}: ${words.length} words`);
});

console.log(`Total words collected: ${allWords.length}`);

// Take first 10,000 (they're already sorted by frequency in the original dictionaries)
const top10k = allWords.slice(0, 10000);

const content = `# Топ 10,000 наиболее часто используемых русских слов\n${top10k.join('\n')}\n`;

const outputFile = path.join(commonDir, 'ru_top10k.txt');
fs.writeFileSync(outputFile, content, 'utf8');

console.log(`Top 10,000 words saved to ru_top10k.txt`);