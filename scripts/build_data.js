const fs = require('fs');
const path = require('path');

const { kanjiList } = require('./data_kanji');
const { grammarList } = require('./data_grammar');
const { buildVocabList } = require('./data_vocab');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log("Generating JLPT N3 datasets...");

// 1. Build Kanji
console.log(`Compiling Kanji (${kanjiList.length} items)...`);
fs.writeFileSync(path.join(dataDir, 'kanji.json'), JSON.stringify(kanjiList, null, 2), 'utf-8');

// 2. Build Grammar
console.log(`Compiling Grammar (${grammarList.length} patterns)...`);
fs.writeFileSync(path.join(dataDir, 'grammar.json'), JSON.stringify(grammarList, null, 2), 'utf-8');

// 3. Build Vocab
const vocabList = buildVocabList();
console.log(`Compiling Vocabulary (${vocabList.length} words)...`);
fs.writeFileSync(path.join(dataDir, 'vocab.json'), JSON.stringify(vocabList, null, 2), 'utf-8');

console.log("✅ All datasets generated successfully in ./data/");
console.log(`Total: Kanji=${kanjiList.length}, Grammar=${grammarList.length}, Vocab=${vocabList.length}`);
