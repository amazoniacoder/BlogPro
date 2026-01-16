const fs = require('fs');
const path = require('path');

// Create partitioned dictionaries by first letter
function partitionDictionary() {
  const dictPath = path.join(__dirname, '../../client/src/plugins/texteditor/dictionaries/russian.txt');
  const outputDir = path.join(__dirname, '../../client/src/plugins/texteditor/dictionaries/partitions');
  
  // Create partitions directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Read the full dictionary
  const content = fs.readFileSync(dictPath, 'utf8');
  const words = content.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
  
  console.log(`Processing ${words.length} words...`);
  
  // Group words by first letter
  const partitions = {};
  
  words.forEach(word => {
    const firstLetter = word[0];
    // Skip words with invalid characters
    if (!firstLetter || firstLetter.charCodeAt(0) < 32) {
      return;
    }
    if (!partitions[firstLetter]) {
      partitions[firstLetter] = [];
    }
    partitions[firstLetter].push(word);
  });
  
  // Write each partition to a separate file
  Object.keys(partitions).forEach(letter => {
    const filename = `ru_${letter}.txt`;
    const filepath = path.join(outputDir, filename);
    const content = partitions[letter].join('\n');
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Created ${filename}: ${partitions[letter].length} words`);
  });
  
  console.log(`\nPartitioning complete! Created ${Object.keys(partitions).length} partitions.`);
}

partitionDictionary();