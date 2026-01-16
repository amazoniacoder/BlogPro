#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class RussianDictionaryTransfer {
  constructor() {
    this.sourceFile = path.join(__dirname, '..', 'Dictionary', 'russian2.txt');
    this.targetDir = path.join(__dirname, '..', '..', '..', '..', 'public', 'assets', 'dictionaries');
    this.outputFile = path.join(this.targetDir, 'ru-russian2-words.txt');
    this.metadataFile = path.join(this.targetDir, 'ru-russian2-metadata.json');
  }

  processSourceFile() {
    const content = fs.readFileSync(this.sourceFile, 'utf-8');
    const words = content
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .sort();

    console.log(`Processed ${words.length} words`);
    return words;
  }

  ensureTargetDirectory() {
    if (!fs.existsSync(this.targetDir)) {
      fs.mkdirSync(this.targetDir, { recursive: true });
    }
  }

  writeWordsFile(words) {
    fs.writeFileSync(this.outputFile, words.join('\n'), 'utf-8');
    console.log(`Written to: ${this.outputFile}`);
  }

  writeMetadataFile(words) {
    const metadata = {
      name: 'Russian Dictionary 2',
      language: 'ru',
      wordCount: words.length,
      createdAt: new Date().toISOString(),
      source: 'russian2.txt'
    };

    fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`Metadata: ${this.metadataFile}`);
    return metadata;
  }

  transfer() {
    console.log('Transferring Russian dictionary...');
    
    this.ensureTargetDirectory();
    const words = this.processSourceFile();
    this.writeWordsFile(words);
    const metadata = this.writeMetadataFile(words);

    console.log(`Complete: ${metadata.wordCount} words transferred`);
  }
}

if (require.main === module) {
  const transfer = new RussianDictionaryTransfer();
  transfer.transfer();
}

module.exports = RussianDictionaryTransfer;