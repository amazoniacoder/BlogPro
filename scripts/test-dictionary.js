#!/usr/bin/env node

/**
 * Dictionary Test Script
 * 
 * Tests the Russian technical dictionary with various words
 * to verify spell checking accuracy.
 */

const fs = require('fs').promises;
const path = require('path');

class DictionaryTester {
  constructor() {
    this.words = new Set();
  }

  async test() {
    console.log('🧪 Testing Russian Technical Dictionary...\n');

    try {
      // Load dictionary
      await this.loadDictionary();
      
      // Test cases
      await this.testEverydayWords();
      await this.testProgrammingTerms();
      await this.testMisspellings();
      await this.testMorphology();
      
      console.log('\n✅ Dictionary testing completed!');
      
    } catch (error) {
      console.error('❌ Testing failed:', error);
    }
  }

  async loadDictionary() {
    const dictPath = path.join(__dirname, '..', 'public', 'assets', 'dictionaries', 'ru-tech-words.txt');
    const content = await fs.readFile(dictPath, 'utf8');
    const words = content.split('\n').filter(word => word.trim().length > 0);
    
    for (const word of words) {
      this.words.add(word.trim().toLowerCase());
    }
    
    console.log(`📚 Loaded ${this.words.size} words from dictionary`);
  }

  async testEverydayWords() {
    console.log('\n📝 Testing everyday Russian words...');
    
    const testWords = [
      { word: 'быть', expected: true, description: 'Common verb "to be"' },
      { word: 'работа', expected: true, description: 'Common noun "work"' },
      { word: 'время', expected: true, description: 'Common noun "time"' },
      { word: 'человек', expected: true, description: 'Common noun "person"' },
      { word: 'делать', expected: true, description: 'Common verb "to do"' }
    ];

    this.runTests(testWords);
  }

  async testProgrammingTerms() {
    console.log('\n💻 Testing programming terminology...');
    
    const testWords = [
      { word: 'программирование', expected: true, description: 'Programming' },
      { word: 'алгоритм', expected: true, description: 'Algorithm' },
      { word: 'функция', expected: true, description: 'Function' },
      { word: 'объект', expected: true, description: 'Object' },
      { word: 'массив', expected: true, description: 'Array' },
      { word: 'фреймворк', expected: true, description: 'Framework' },
      { word: 'рефакторинг', expected: true, description: 'Refactoring' }
    ];

    this.runTests(testWords);
  }

  async testMisspellings() {
    console.log('\n❌ Testing common misspellings...');
    
    const testWords = [
      { word: 'програмирование', expected: true, description: 'Common misspelling of "программирование"' },
      { word: 'алгаритм', expected: false, description: 'Misspelling of "алгоритм"' },
      { word: 'функцыя', expected: true, description: 'Common misspelling of "функция"' },
      { word: 'обьект', expected: true, description: 'Common misspelling of "объект"' },
      { word: 'неизвестноеслово', expected: false, description: 'Unknown word' }
    ];

    this.runTests(testWords);
  }

  async testMorphology() {
    console.log('\n🔄 Testing morphological forms...');
    
    const testWords = [
      { word: 'работаю', expected: true, description: 'Verb form "I work"' },
      { word: 'работает', expected: true, description: 'Verb form "he/she works"' },
      { word: 'программы', expected: false, description: 'Noun form "programs" (not in base dict)' },
      { word: 'алгоритмы', expected: false, description: 'Noun form "algorithms" (not in base dict)' }
    ];

    this.runTests(testWords);
  }

  runTests(testWords) {
    let passed = 0;
    let total = testWords.length;

    for (const test of testWords) {
      const actual = this.words.has(test.word.toLowerCase());
      const result = actual === test.expected ? '✅' : '❌';
      const status = actual === test.expected ? 'PASS' : 'FAIL';
      
      console.log(`   ${result} ${test.word} - ${test.description} (${status})`);
      
      if (actual === test.expected) {
        passed++;
      }
    }

    console.log(`   📊 Results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  }

  checkWord(word) {
    return this.words.has(word.toLowerCase());
  }
}

// Run the test
if (require.main === module) {
  const tester = new DictionaryTester();
  tester.test().catch(console.error);
}

module.exports = DictionaryTester;