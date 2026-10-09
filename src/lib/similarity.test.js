import test from 'node:test'
import assert from 'node:assert/strict'
import { computeSimilarity, groupSimilarWords } from './similarity.js'

const entry = (word, synonyms = [], extra = {}) => ({ word, synonyms, partOfSpeech: 'adjective', definition: 'having a particular quality', sentences: ['The person was very good.'], ...extra })

test('grammar, boilerplate definitions, empty contexts, and examples do not establish synonymy', () => {
  assert.equal(computeSimilarity(entry('acquisitiveness'), entry('irascibility')), 0)
  assert.equal(computeSimilarity(entry('conventional', ['usual']), entry('heterodox', ['unusual'])), 0)
  assert.equal(computeSimilarity(entry('a', ['good']), entry('b', ['good'])), 0)
})
test('antonyms override shared synonym evidence', () => {
  assert.equal(computeSimilarity(entry('orthodox', ['conventional', 'traditional'], { antonyms: ['heterodox'] }), entry('heterodox', ['conventional', 'traditional'])), 0)
})
test('direct synonyms and multiple shared synonyms establish evidence', () => {
  assert.ok(computeSimilarity(entry('alleviate', ['assuage']), entry('assuage')) >= .8)
  assert.ok(computeSimilarity(entry('tenacious', ['persistent', 'determined']), entry('pertinacious', ['persistent', 'determined'])) >= .55)
})
test('mutual similarity prevents bridge chains and duplicate memberships', () => {
  const words = [entry('alpha', ['beta']), entry('beta', ['gamma']), entry('gamma'), entry(' ALPHA ', ['beta'])]
  const groups = groupSimilarWords(words)
  const members = groups.flatMap(g => g.words.map(w => w.word.trim().toLowerCase()))
  assert.equal(new Set(members).size, members.length)
  for (const group of groups) for (const a of group.words) for (const b of group.words) {
    if (a !== b) assert.ok(computeSimilarity(a, b) >= .55)
  }
})
test('groups sort strongest first and do not depend on input order', () => {
  const words = [entry('a', ['b']), entry('b', ['a']), entry('c', ['shared', 'other', 'extra']), entry('d', ['shared', 'other', 'different'])]
  const groups = groupSimilarWords(words)
  assert.equal(groups.length, 2)
  assert.ok(groups[0].avgSimilarity >= groups[1].avgSimilarity)
  assert.deepEqual(groups, groupSimilarWords([...words].reverse()))
})
test('a word belongs to its stronger synonym group', () => {
  const groups = groupSimilarWords([entry('a', ['b']), entry('b', ['shared', 'other']), entry('c', ['shared', 'other'])])
  assert.deepEqual(groups.map(g => g.words.map(w => w.word)), [['a', 'b']])
})
