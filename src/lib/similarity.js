// Conservative lexical evidence. Grammar and examples cannot establish synonymy.
const CONFIG = { MIN_PAIRWISE_SIMILARITY: 0.55, MIN_GROUP_SIZE: 2, MAX_GROUP_SIZE: 10 }
const normalize = value => String(value || '').toLowerCase().trim().replace(/\s+/g, ' ')
function senses(entry) { return Array.isArray(entry.definitions) ? entry.definitions : [entry] }
function terms(entry, field) { return new Set(senses(entry).flatMap(s => s[field] || []).map(normalize).filter(Boolean)) }
export function computeSimilarity(a, b) {
  if (!a || !b || normalize(a.word) === normalize(b.word)) return 0
  const aw = normalize(a.word), bw = normalize(b.word)
  const as = terms(a, 'synonyms'), bs = terms(b, 'synonyms')
  const aa = terms(a, 'antonyms'), ba = terms(b, 'antonyms')
  if (aa.has(bw) || ba.has(aw) || [...as].some(s => ba.has(s)) || [...bs].some(s => aa.has(s))) return 0
  const direct = as.has(bw) || bs.has(aw)
  const shared = [...as].filter(s => bs.has(s)).length
  // One broad shared synonym is insufficient; require direct or multiple links.
  if (!direct && shared < 2) return 0
  return Math.min(1, (direct ? 0.8 : 0.55) + 0.2 * shared / Math.max(1, Math.min(as.size, bs.size)))
}
export function groupSimilarWords(entries) {
  const words = [...new Map((entries || []).filter(w => normalize(w.word)).map(w => [normalize(w.word), w])).values()]
    .sort((a, b) => normalize(a.word).localeCompare(normalize(b.word)))
  const n = words.length
  const scores = Array.from({ length: n }, () => new Float64Array(n))
  const pairs = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const score = computeSimilarity(words[i], words[j])
    scores[i][j] = scores[j][i] = score
    if (score >= CONFIG.MIN_PAIRWISE_SIMILARITY) pairs.push({ i, j, score })
  }
  pairs.sort((a, b) => b.score - a.score || a.i - b.i || a.j - b.j)
  const average = indices => {
    let sum = 0, count = 0
    for (let i = 0; i < indices.length; i++) for (let j = i + 1; j < indices.length; j++) {
      sum += scores[indices[i]][indices[j]]; count++
    }
    return count ? sum / count : 0
  }
  const candidates = new Map()
  for (const { i, j } of pairs) {
    const group = [i, j]
    while (group.length < CONFIG.MAX_GROUP_SIZE) {
      let best = -1, bestAffinity = -1
      for (let k = 0; k < n; k++) {
        if (group.includes(k) || !group.every(m => scores[k][m] >= CONFIG.MIN_PAIRWISE_SIMILARITY)) continue
        const affinity = group.reduce((s, m) => s + scores[k][m], 0) / group.length
        if (affinity > bestAffinity) { best = k; bestAffinity = affinity }
      }
      if (best < 0) break
      group.push(best)
    }
    candidates.set([...group].sort((a, b) => a - b).join(','), { indices: group, avgSimilarity: average(group) })
  }
  // Give each word to the candidate with its strongest average connection.
  const ranked = [...candidates.values()].sort((a, b) => b.avgSimilarity - a.avgSimilarity || b.indices.length - a.indices.length)
  const owners = new Map()
  for (const candidate of ranked) for (const index of candidate.indices) {
    const affinity = candidate.indices.reduce((s, m) => s + scores[index][m], 0) / (candidate.indices.length - 1)
    if (!owners.has(index) || affinity > owners.get(index).affinity) owners.set(index, { candidate, affinity })
  }
  return ranked.map(candidate => {
    const indices = candidate.indices.filter(i => owners.get(i)?.candidate === candidate)
    return { words: indices.map(i => words[i]), avgSimilarity: average(indices) }
  }).filter(g => g.words.length >= CONFIG.MIN_GROUP_SIZE).sort((a, b) => b.avgSimilarity - a.avgSimilarity)
}
export function getConfig() { return { ...CONFIG } }
export function updateConfig(updates) { Object.assign(CONFIG, updates) }
