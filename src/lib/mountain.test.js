import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { selectMountainWords, filterMountainWords } from './mountain.js'

const vocabulary = JSON.parse(readFileSync(new URL('../data/mountainWords.json', import.meta.url), 'utf8'))
const saved = new Map([['abound', { word: 'abound', difficulty: 'hard' }]])

test('each group keeps all 30 words even if every word is saved', () => {
  for (let group = 1; group <= 34; group++) {
    const words = selectMountainWords(vocabulary, [group])
    const allSaved = new Map(words.map(w => [w.word, { ...w, difficulty: 'easy' }]))
    assert.equal(filterMountainWords(words, allSaved).length, 30)
    assert.equal(filterMountainWords(words, allSaved, 'new').length, 0)
  }
})
test('new-word filtering uses only the provided active user list', () => {
  const words = selectMountainWords(vocabulary, [1])
  assert.equal(filterMountainWords(words, saved).length, 30)
  assert.equal(filterMountainWords(words, saved, 'new').length, 29)
  assert.ok(!filterMountainWords(words, saved, 'new').some(w => w.word === 'abound'))
  assert.equal(filterMountainWords(words, new Map(), 'new').length, 30)
  assert.ok(filterMountainWords(words, new Map(), 'new').some(w => w.word === 'abound'))
})
test('combined groups do not repeat a word while individual groups retain it', () => {
  assert.equal(selectMountainWords(vocabulary, [11]).length, 30)
  assert.equal(selectMountainWords(vocabulary, [22]).length, 30)
  assert.equal(selectMountainWords(vocabulary, [11, 22]).length, 59)
})
