#!/usr/bin/env node

/**
 * Тест качественного словаря
 * 
 * Проверяет качество и точность нашего словаря
 * с реальными русскими словами.
 */

const fs = require('fs').promises;
const path = require('path');

class QualityDictionaryTester {
  constructor() {
    this.words = new Set();
  }

  async test() {
    console.log('🧪 Тестирование качественного русского словаря...\n');

    try {
      await this.loadDictionary();
      await this.testRealWords();
      await this.testTechnicalTerms();
      await this.testMorphology();
      await this.testInvalidWords();
      
      console.log('\n✅ Все тесты завершены!');
      
    } catch (error) {
      console.error('❌ Ошибка тестирования:', error);
    }
  }

  async loadDictionary() {
    console.log('📚 Загрузка словаря...');
    
    const dictPath = path.join(__dirname, '..', 'public', 'assets', 'dictionaries', 'ru-quality-final.txt');
    const content = await fs.readFile(dictPath, 'utf8');
    const words = content.split('\n').filter(word => word.trim().length > 0);
    
    for (const word of words) {
      this.words.add(word.trim().toLowerCase());
    }
    
    console.log(`   ✓ Загружено ${this.words.size} слов`);
  }

  async testRealWords() {
    console.log('\n📝 Тест реальных русских слов...');
    
    const realWords = [
      { word: 'привет', expected: true, description: 'Приветствие' },
      { word: 'спасибо', expected: true, description: 'Благодарность' },
      { word: 'пожалуйста', expected: true, description: 'Вежливость' },
      { word: 'извините', expected: true, description: 'Извинение' },
      { word: 'программирование', expected: true, description: 'Техническое слово' },
      { word: 'алгоритм', expected: true, description: 'Техническое слово' },
      { word: 'компьютер', expected: true, description: 'Техническое слово' },
      { word: 'интернет', expected: true, description: 'Современное слово' },
      { word: 'москва', expected: true, description: 'Географическое название' },
      { word: 'александр', expected: true, description: 'Имя' }
    ];

    this.runTestSuite('Реальные слова', realWords);
  }

  async testTechnicalTerms() {
    console.log('\n💻 Тест технических терминов...');
    
    const technicalWords = [
      { word: 'функция', expected: true, description: 'Программирование' },
      { word: 'метод', expected: true, description: 'Программирование' },
      { word: 'класс', expected: true, description: 'ООП' },
      { word: 'объект', expected: true, description: 'ООП' },
      { word: 'массив', expected: true, description: 'Структура данных' },
      { word: 'строка', expected: true, description: 'Тип данных' },
      { word: 'база', expected: true, description: 'База данных' },
      { word: 'сервер', expected: true, description: 'Инфраструктура' }
    ];

    this.runTestSuite('Технические термины', technicalWords);
  }

  async testMorphology() {
    console.log('\n🔄 Тест морфологических форм...');
    
    const morphologyWords = [
      { word: 'программы', expected: true, description: 'Множественное число' },
      { word: 'алгоритмов', expected: true, description: 'Родительный падеж мн.ч.' },
      { word: 'функции', expected: true, description: 'Именительный падеж мн.ч.' },
      { word: 'методом', expected: true, description: 'Творительный падеж' },
      { word: 'классе', expected: true, description: 'Предложный падеж' },
      { word: 'объектами', expected: true, description: 'Творительный падеж мн.ч.' }
    ];

    this.runTestSuite('Морфологические формы', morphologyWords);
  }

  async testInvalidWords() {
    console.log('\n❌ Тест недопустимых слов...');
    
    const invalidWords = [
      { word: 'идтекчик', expected: false, description: 'Бессмысленная комбинация' },
      { word: 'игратамник', expected: false, description: 'Бессмысленная комбинация' },
      { word: 'неизвестноеслово', expected: false, description: 'Несуществующее слово' },
      { word: 'абракадабра', expected: false, description: 'Выдуманное слово' },
      { word: 'qwerty', expected: false, description: 'Английские буквы' },
      { word: '12345', expected: false, description: 'Только цифры' }
    ];

    this.runTestSuite('Недопустимые слова', invalidWords);
  }

  runTestSuite(suiteName, tests) {
    let passed = 0;
    let total = tests.length;

    console.log(`   🧪 ${suiteName}:`);
    
    for (const test of tests) {
      const actual = this.words.has(test.word.toLowerCase());
      const result = actual === test.expected ? '✅' : '❌';
      const status = actual === test.expected ? 'ПРОШЁЛ' : 'ПРОВАЛИЛСЯ';
      
      console.log(`      ${result} ${test.word} - ${test.description} (${status})`);
      
      if (actual === test.expected) {
        passed++;
      }
    }

    const percentage = Math.round((passed / total) * 100);
    console.log(`   📊 Результат: ${passed}/${total} тестов прошли (${percentage}%)`);
  }
}

// Запускаем тест
if (require.main === module) {
  const tester = new QualityDictionaryTester();
  tester.test().catch(console.error);
}

module.exports = QualityDictionaryTester;