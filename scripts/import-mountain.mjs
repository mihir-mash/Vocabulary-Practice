import { readFile, writeFile } from 'node:fs/promises'

// Keep the local source ignored; ship its validated app dataset with the site.
const words = JSON.parse(await readFile(new URL('../vocab.json', import.meta.url), 'utf8'))
if (!Array.isArray(words) || words.length !== 1020) throw new Error('Expected 1,020 vocabulary entries')
for (let group = 1; group <= 34; group++) {
  if (words.filter(w => w.group === group).length !== 30) throw new Error(`Group ${group} must contain 30 words`)
}
for (const entry of words) {
  // The supplied source omits the adjective definition for this one sense.
  if (entry.word === 'appropriate') for (const sense of entry.definitions || []) {
    if (sense.part_of_speech === 'adjective' && !sense.definition) sense.definition = 'suitable or proper in the circumstances'
  }
  if (!entry.word || !Array.isArray(entry.definitions) || !entry.definitions.length || entry.definitions.some(d => !d.definition || !d.part_of_speech)) {
    throw new Error(`Invalid entry: ${entry.word}`)
  }
}
await writeFile(new URL('../src/data/mountainWords.json', import.meta.url), `${JSON.stringify(words, null, 2)}\n`)
console.log('Imported 1,020 words across 34 groups.')
