const fs = require('fs');
const path = require('path');

const partitionsDir = path.join(__dirname, '..', 'dictionaries', 'partitions');
const prefixesDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// All valid Russian prefixes by letter
const allPrefixes = {
  'б': ['ба', 'бе', 'би', 'бл', 'бо', 'бр', 'бу', 'бы', 'бэ', 'бю', 'бя'],
  'в': ['ва', 'ве', 'ви', 'вл', 'во', 'вр', 'ву', 'вы', 'вэ', 'вю', 'вя'],
  'г': ['га', 'ге', 'ги', 'гл', 'го', 'гр', 'гу', 'гы', 'гэ', 'гю', 'гя'],
  'д': ['да', 'де', 'ди', 'до', 'др', 'ду', 'ды', 'дэ', 'дю', 'дя'],
  'е': ['ев', 'ег', 'ед', 'ез', 'ек', 'ел', 'ем', 'ен', 'ер', 'ес', 'еф'],
  'ж': ['жа', 'же', 'жи', 'жо', 'жу', 'жы'],
  'з': ['за', 'зе', 'зи', 'зл', 'зм', 'зн', 'зо', 'зр', 'зу', 'зы', 'зэ', 'зю', 'зя'],
  'и': ['иг', 'из', 'ик', 'ил', 'им', 'ин', 'ир', 'ис', 'их'],
  'к': ['ка', 'ке', 'ки', 'кл', 'км', 'кн', 'ко', 'кр', 'кс', 'кт', 'ку', 'кы', 'кэ', 'кю', 'кя'],
  'л': ['ла', 'ле', 'ли', 'ло', 'лу', 'лы', 'лэ', 'лю', 'ля'],
  'м': ['ма', 'ме', 'ми', 'мн', 'мо', 'мр', 'му', 'мы', 'мэ', 'мю', 'мя'],
  'н': ['на', 'не', 'ни', 'но', 'ну', 'ны', 'нэ', 'ню', 'ня'],
  'о': ['об', 'ов', 'ог', 'од', 'ож', 'оз', 'ок', 'ол', 'ом', 'он', 'оп', 'ор', 'ос', 'от', 'оф', 'ох', 'оч', 'ош'],
  'п': ['па', 'пе', 'пи', 'пл', 'по', 'пр', 'пс', 'пт', 'пу', 'пы', 'пэ', 'пю', 'пя'],
  'р': ['ра', 'ре', 'ри', 'ро', 'ру', 'ры', 'рэ', 'рю', 'ря'],
  'с': ['са', 'се', 'си', 'ск', 'сл', 'см', 'сн', 'со', 'сп', 'ср', 'ст', 'су', 'сх', 'сч', 'сы', 'сэ', 'сю', 'ся'],
  'т': ['та', 'те', 'ти', 'то', 'тр', 'ту', 'ты', 'тэ', 'тю', 'тя'],
  'у': ['уб', 'ув', 'уг', 'уд', 'уж', 'уз', 'ук', 'ул', 'ум', 'ун', 'уп', 'ур', 'ус', 'ут', 'уф', 'ух', 'уч', 'уш'],
  'ф': ['фа', 'фе', 'фи', 'фл', 'фо', 'фр', 'фу', 'фы', 'фэ', 'фю', 'фя'],
  'х': ['ха', 'хе', 'хи', 'хл', 'хм', 'хо', 'хр', 'ху', 'хы', 'хэ', 'хю', 'хя'],
  'ц': ['ца', 'це', 'ци', 'цо', 'цу', 'цы'],
  'ч': ['ча', 'че', 'чи', 'чо', 'чу', 'чы'],
  'ш': ['ша', 'ше', 'ши', 'шл', 'шм', 'шн', 'шо', 'шп', 'шр', 'шт', 'шу', 'шы'],
  'щ': ['ща', 'ще', 'щи', 'що', 'щу', 'щы'],
  'э': ['эв', 'эг', 'эд', 'эк', 'эл', 'эм', 'эн', 'эр', 'эс', 'эт', 'эф', 'эх'],
  'ю': ['юг', 'юж', 'юз', 'юн', 'юр', 'юс', 'ют'],
  'я': ['яб', 'яв', 'яг', 'яд', 'яз', 'як', 'ял', 'ям', 'ян', 'яр', 'яс', 'ят', 'ях']
};

console.log('Extracting all prefix words...');

Object.keys(allPrefixes).forEach(letter => {
  const dictPath = path.join(partitionsDir, `ru_${letter}.txt`);
  
  if (!fs.existsSync(dictPath)) {
    console.log(`Dictionary ru_${letter}.txt not found, skipping...`);
    return;
  }

  const words = fs.readFileSync(dictPath, 'utf8')
    .split('\n')
    .map(word => word.trim())
    .filter(word => word.length > 0);

  console.log(`Processing ${words.length} words starting with ${letter}`);

  const prefixGroups = {};
  allPrefixes[letter].forEach(prefix => prefixGroups[prefix] = []);

  words.forEach(word => {
    if (word.length >= 2) {
      const prefix = word.substring(0, 2);
      if (prefixGroups[prefix]) {
        prefixGroups[prefix].push(word);
      }
    }
  });

  allPrefixes[letter].forEach(prefix => {
    const words = prefixGroups[prefix];
    const prefixFile = path.join(prefixesDir, `ru_${prefix}.txt`);
    
    if (words.length > 0) {
      const existingContent = fs.existsSync(prefixFile) ? fs.readFileSync(prefixFile, 'utf8').trim() : '';
      if (!existingContent) {
        fs.writeFileSync(prefixFile, words.join('\n') + '\n', 'utf8');
        console.log(`${prefix}: ${words.length} words`);
      } else {
        console.log(`${prefix}: already has content, skipping`);
      }
    }
  });
});

console.log('All prefix extraction complete!');