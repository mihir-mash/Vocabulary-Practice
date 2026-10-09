export const normalizeMountainWord = word => word.trim().toLowerCase()

export function selectMountainWords(vocabulary, groups) {
  const seen = new Set()
  return vocabulary.filter(entry => {
    const word = normalizeMountainWord(entry.word)
    if (!groups.includes(entry.group) || seen.has(word)) return false
    seen.add(word)
    return true
  })
}

export function filterMountainWords(words, saved, filter = 'all', query = '') {
  return words.filter(word => {
    const entry = saved.get(normalizeMountainWord(word.word))
    const matchesStatus = filter === 'all' || (filter === 'new' ? !entry : entry?.difficulty === filter)
    return matchesStatus && (!query || [word.word, ...word.definitions.flatMap(d => [d.definition, d.example, ...(d.synonyms || [])])].join(' ').toLowerCase().includes(query.toLowerCase()))
  })
}
