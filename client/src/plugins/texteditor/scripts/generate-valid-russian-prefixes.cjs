const fs = require('fs');
const path = require('path');

const rareDir = path.join(__dirname, '..', 'dictionaries', 'prefixes', 'rare');

// Valid Russian prefixes (linguistically realistic combinations)
const validPrefixes = [
  // б- combinations
  'ба', 'бе', 'би', 'бл', 'бо', 'бр', 'бу', 'бы', 'бэ', 'бю', 'бя',
  
  // в- combinations  
  'ва', 'ве', 'ви', 'вл', 'во', 'вр', 'ву', 'вы', 'вэ', 'вю', 'вя',
  
  // г- combinations
  'га', 'ге', 'ги', 'гл', 'го', 'гр', 'гу', 'гы', 'гэ', 'гю', 'гя',
  
  // д- combinations
  'да', 'де', 'ди', 'до', 'др', 'ду', 'ды', 'дэ', 'дю', 'дя',
  
  // е- combinations
  'ев', 'ег', 'ед', 'ез', 'ек', 'ел', 'ем', 'ен', 'ер', 'ес', 'еф',
  
  // ж- combinations
  'жа', 'же', 'жи', 'жо', 'жу', 'жы',
  
  // з- combinations
  'за', 'зе', 'зи', 'зл', 'зм', 'зн', 'зо', 'зр', 'зу', 'зы', 'зэ', 'зю', 'зя',
  
  // и- combinations
  'иг', 'из', 'ик', 'ил', 'им', 'ин', 'ир', 'ис', 'их',
  
  // к- combinations
  'ка', 'ке', 'ки', 'кл', 'км', 'кн', 'ко', 'кр', 'кс', 'кт', 'ку', 'кы', 'кэ', 'кю', 'кя',
  
  // л- combinations
  'ла', 'ле', 'ли', 'ло', 'лу', 'лы', 'лэ', 'лю', 'ля',
  
  // м- combinations
  'ма', 'ме', 'ми', 'мн', 'мо', 'мр', 'му', 'мы', 'мэ', 'мю', 'мя',
  
  // н- combinations
  'на', 'не', 'ни', 'но', 'ну', 'ны', 'нэ', 'ню', 'ня',
  
  // о- combinations
  'об', 'ов', 'ог', 'од', 'ож', 'оз', 'ок', 'ол', 'ом', 'он', 'оп', 'ор', 'ос', 'от', 'оф', 'ох', 'оч', 'ош',
  
  // п- combinations
  'па', 'пе', 'пи', 'пл', 'по', 'пр', 'пс', 'пт', 'пу', 'пы', 'пэ', 'пю', 'пя',
  
  // р- combinations
  'ра', 'ре', 'ри', 'ро', 'ру', 'ры', 'рэ', 'рю', 'ря',
  
  // с- combinations
  'са', 'се', 'си', 'ск', 'сл', 'см', 'сн', 'со', 'сп', 'ср', 'ст', 'су', 'сх', 'сч', 'сы', 'сэ', 'сю', 'ся',
  
  // т- combinations
  'та', 'те', 'ти', 'то', 'тр', 'ту', 'ты', 'тэ', 'тю', 'тя',
  
  // у- combinations
  'уб', 'ув', 'уг', 'уд', 'уж', 'уз', 'ук', 'ул', 'ум', 'ун', 'уп', 'ур', 'ус', 'ут', 'уф', 'ух', 'уч', 'уш',
  
  // ф- combinations
  'фа', 'фе', 'фи', 'фл', 'фо', 'фр', 'фу', 'фы', 'фэ', 'фю', 'фя',
  
  // х- combinations
  'ха', 'хе', 'хи', 'хл', 'хм', 'хо', 'хр', 'ху', 'хы', 'хэ', 'хю', 'хя',
  
  // ц- combinations
  'ца', 'це', 'ци', 'цо', 'цу', 'цы',
  
  // ч- combinations
  'ча', 'че', 'чи', 'чо', 'чу', 'чы',
  
  // ш- combinations
  'ша', 'ше', 'ши', 'шл', 'шм', 'шн', 'шо', 'шп', 'шр', 'шт', 'шу', 'шы',
  
  // щ- combinations
  'ща', 'ще', 'щи', 'що', 'щу', 'щы',
  
  // э- combinations
  'эв', 'эг', 'эд', 'эк', 'эл', 'эм', 'эн', 'эр', 'эс', 'эт', 'эф', 'эх',
  
  // ю- combinations
  'юг', 'юж', 'юз', 'юн', 'юр', 'юс', 'ют',
  
  // я- combinations
  'яб', 'яв', 'яг', 'яд', 'яз', 'як', 'ял', 'ям', 'ян', 'яр', 'яс', 'ят', 'ях'
];

console.log(`Creating ${validPrefixes.length} valid Russian prefix files...`);

// First, remove invalid files that were created
const allFiles = fs.readdirSync(rareDir);
const invalidFiles = allFiles.filter(file => {
  if (!file.startsWith('ru_') || !file.endsWith('.txt')) return false;
  const prefix = file.slice(3, -4); // Remove 'ru_' and '.txt'
  return prefix.length === 2 && !validPrefixes.includes(prefix);
});

console.log(`Removing ${invalidFiles.length} invalid prefix files...`);
invalidFiles.forEach(file => {
  fs.unlinkSync(path.join(rareDir, file));
  console.log(`Removed: ${file}`);
});

// Create valid prefix files
validPrefixes.forEach(prefix => {
  const filename = `ru_${prefix}.txt`;
  const filepath = path.join(rareDir, filename);
  
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '', 'utf8');
    console.log(`Created: ${filename}`);
  } else {
    console.log(`Exists: ${filename}`);
  }
});

console.log('Valid Russian prefix file generation complete!');