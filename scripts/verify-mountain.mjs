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
    assert.equal((markup.match(/<article /g) || []).length, 30)
    for (const entry of dataset.filter(w => w.group === group)) assert.ok(markup.includes(entry.word))
    assert.ok(markup.includes('Practice'))
    assert.ok(markup.includes('Hide meanings'))
  }
  globalThis.window = { localStorage: { getItem: () => JSON.stringify([11, 22]) } }
  const combined = renderToStaticMarkup(React.createElement(MountainPage, {
    activeUsername: 'test', savedWords: [], loadingWords: false,
    onSaveWord: async () => {}, onUpdateWord: async () => {},
  }))
  assert.equal((combined.match(/<article /g) || []).length, 59)
  console.log('All 34 groups render 30 words with study controls; 1,020 entries preserved.')
} finally { delete globalThis.window; await server.close() }
