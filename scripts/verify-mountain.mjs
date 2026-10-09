import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFile } from 'node:fs/promises'

const source = JSON.parse(await readFile(new URL('../vocab.json', import.meta.url), 'utf8'))
const dataset = JSON.parse(await readFile(new URL('../src/data/mountainWords.json', import.meta.url), 'utf8'))
assert.equal(dataset.length, 1020)
assert.equal(new Set(dataset.map(w => w.word)).size, new Set(source.map(w => w.word)).size)
for (const entry of dataset) {
  const original = source.find(w => w.slug === entry.slug)
  assert.equal(entry.group, original.group)
  assert.equal(entry.definitions.length, original.definitions.length)
  assert.ok(entry.definitions.every(d => d.definition))
}
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: MountainPage } = await server.ssrLoadModule('/src/pages/MountainPage.jsx')
  for (let group = 1; group <= 34; group++) {
    globalThis.window = { localStorage: { getItem: () => JSON.stringify([group]) } }
    const markup = renderToStaticMarkup(React.createElement(MountainPage, {
      activeUsername: 'test', savedWords: [], loadingWords: false,
      onSaveWord: async () => {}, onUpdateWord: async () => {},
    }))
    assert.ok(markup.includes('aria-label="Practice progress" value="1" max="30"'))
    assert.ok(markup.includes('aria-label="Vocabulary flashcards"'))
    assert.ok(markup.includes(dataset.find(w => w.group === group).word))
    assert.ok(markup.includes('Flip back'))
    assert.ok(!markup.includes('Reveal meaning'))
    assert.ok(!markup.includes('Climb your vocab mountain'))
    assert.ok(!markup.includes('>All</button>'))
    assert.ok(markup.indexOf('>Practice</button>') < markup.indexOf('>Words</button>'))
    assert.ok(markup.includes('Practice'))
    assert.ok(markup.includes('Only new words'))
  }
  globalThis.window = { localStorage: { getItem: () => JSON.stringify([11, 22]) } }
  const combined = renderToStaticMarkup(React.createElement(MountainPage, {
    activeUsername: 'test', savedWords: [], loadingWords: false,
    onSaveWord: async () => {}, onUpdateWord: async () => {},
  }))
  assert.ok(combined.includes('aria-label="Practice progress" value="1" max="59"'))
  const renderUser = username => {
    globalThis.window = { localStorage: { getItem: key => { assert.equal(key, `mountain-groups-${username}`); return '[1]' } } }
    return renderToStaticMarkup(React.createElement(MountainPage, {
      activeUsername: username,
      savedWords: username === 'alice' ? [{ word: 'abound', difficulty: 'easy' }] : [],
      loadingWords: false, onSaveWord: async () => {}, onUpdateWord: async () => {},
    }))
  }
  const alice = renderUser('alice'), bob = renderUser('bob')
  assert.ok(alice.includes('aria-label="Already in your List"'))
  assert.ok(alice.includes('Group 1, 1 of 30 words in your list'))
  assert.ok(!bob.includes('aria-label="Already in your List"'))
  assert.ok(bob.includes('Group 1, 0 of 30 words in your list'))
  assert.ok(alice.includes('max="30"') && bob.includes('max="30"'))
  console.log('All 34 groups open in Practice with 30-card decks, flip controls, and user-specific saved markers.')
} finally { delete globalThis.window; await server.close() }
