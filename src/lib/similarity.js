/**
 * SEMANTIC SIMILARITY ENGINE WITH EMBEDDINGS
 * 
 * Approach:
 * 1. Generate semantic embeddings from word data (definition, synonyms, POS, examples)
 * 2. Compute cosine similarity between embeddings (primary signal)
 * 3. Use linguistic features (POS, synonyms, context) as secondary signals
 * 4. Apply strict clustering that enforces mutual similarity
 * 5. Use configurable thresholds for calibration
 */

// ============================================================================
// CONFIGURATION - Adjust these to calibrate performance
// ============================================================================

const CONFIG = {
  // Primary embedding similarity threshold (0-1)
  // Words must exceed this to be considered similar
  EMBEDDING_SIMILARITY_THRESHOLD: 0.30,
  
  // Secondary signal thresholds (0-1)
  POS_COMPATIBILITY_THRESHOLD: 0.5,
  SYNONYM_OVERLAP_THRESHOLD: 0.2,
  
  // Clustering parameters
  // Minimum average pairwise similarity within a group
  MIN_GROUP_INTERNAL_SIMILARITY: 0.28,
  
  // Minimum similarity for any pair in a group
  MIN_PAIRWISE_SIMILARITY: 0.25,
  
  // Minimum words per group
  MIN_GROUP_SIZE: 3,
  
  // Maximum words per group (prevent mega-groups)
  MAX_GROUP_SIZE: 10,
}

// ============================================================================
// STEP 1: SEMANTIC EMBEDDING GENERATION
// ============================================================================

/**
 * Tokenize text for word frequency analysis
 */
function tokenize(str) {
  if (!str) return []
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

/**
 * Build a vocabulary of all unique words across all word entries
 * Used for creating fixed-size embedding vectors
 */
function buildVocabulary(words) {
  const vocab = new Set()
  
  words.forEach((w) => {
    // Add definition tokens
    const defTokens = tokenize(w.definition || '')
    defTokens.forEach((t) => vocab.add(t))
    
    // Add part of speech tokens
    const posTokens = tokenize(w.partOfSpeech || '')
    posTokens.forEach((t) => vocab.add(t))
    
    // Add synonym tokens
    const synonyms = w.synonyms || []
    synonyms.forEach((syn) => {
      const synTokens = tokenize(syn || '')
      synTokens.forEach((t) => vocab.add(t))
    })
    
    // Add sentence tokens
    const sentences = w.sentences || []
    sentences.forEach((sent) => {
      const sentTokens = tokenize(sent || '')
      sentTokens.forEach((t) => vocab.add(t))
    })
  })
  
  return Array.from(vocab)
}

/**
 * Generate semantic embedding for a word
 * Embedding represents: definition + synonyms + POS + examples in a fixed-size vector
 */
function generateEmbedding(wordEntry, vocabulary) {
  const embedding = new Array(vocabulary.length).fill(0)
  const wordTokens = new Map()
  
  // Extract and weight different fields
  const fields = [
    { text: wordEntry.definition || '', weight: 0.4 },  // Definition is most important
    { text: wordEntry.partOfSpeech || '', weight: 0.15 },
    { text: (wordEntry.synonyms || []).join(' '), weight: 0.25 },
    { text: (wordEntry.sentences || []).join(' '), weight: 0.2 },
  ]
  
  // Count token frequencies weighted by field importance
  fields.forEach(({ text, weight }) => {
    tokenize(text).forEach((token) => {
      wordTokens.set(token, (wordTokens.get(token) || 0) + weight)
    })
  })
  
  // Map token frequencies to vocabulary indices
  for (let i = 0; i < vocabulary.length; i++) {
    embedding[i] = wordTokens.get(vocabulary[i]) || 0
  }
  
  // Normalize embedding to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude
    }
  }
  
  return embedding
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(emb1, emb2) {
  let dotProduct = 0
  for (let i = 0; i < emb1.length; i++) {
    dotProduct += emb1[i] * emb2[i]
  }
  return dotProduct
}

// ============================================================================
// STEP 2: SECONDARY LINGUISTIC SIGNALS
// ============================================================================

function computeJaccard(set1, set2) {
  if (set1.size === 0 && set2.size === 0) return 1
  if (set1.size === 0 || set2.size === 0) return 0
  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])
  return intersection.size / union.size
}

function getPOSCompatibility(pos1, pos2) {
  if (!pos1 || !pos2) return 0
  pos1 = pos1.toLowerCase()
  pos2 = pos2.toLowerCase()
  if (pos1 === pos2) return 1.0
  
  // Same general category gets partial credit
  const nounLike = ['noun', 'noun phrase']
  const verbLike = ['verb', 'verb phrase']
  const adjLike = ['adjective', 'adjective phrase']
  const advLike = ['adverb', 'adverb phrase']
  
  const isInCategory = (word, category) => category.some((c) => word.includes(c))
  
  if (isInCategory(pos1, nounLike) && isInCategory(pos2, nounLike)) return 0.8
  if (isInCategory(pos1, verbLike) && isInCategory(pos2, verbLike)) return 0.8
  if (isInCategory(pos1, adjLike) && isInCategory(pos2, adjLike)) return 0.8
  if (isInCategory(pos1, advLike) && isInCategory(pos2, advLike)) return 0.8
  
  return 0.2 // Different categories, but still somewhat compatible
}

function getSynonymSimilarity(word1, word2) {
  const syns1 = new Set((word1.synonyms || []).map((s) => s.toLowerCase()))
  const syns2 = new Set((word2.synonyms || []).map((s) => s.toLowerCase()))
  
  if (syns1.size === 0 || syns2.size === 0) return 0
  
  const common = [...syns1].filter((s) => syns2.has(s)).length
  return common / Math.max(syns1.size, syns2.size)
}

// ============================================================================
// STEP 3: COMPUTE COMPOSITE SIMILARITY
// ============================================================================

/**
 * Compute comprehensive similarity between two words
 * PRIMARY: Semantic embedding similarity
 * SECONDARY: POS compatibility, synonym overlap, context
 */
export function computeSimilarity(word1, word2, embeddings, vocabulary) {
  if (!word1 || !word2) return 0
  if (word1.word === word2.word) return 0
  
  // Generate embeddings if not provided (for individual checks)
  let emb1, emb2
  if (embeddings) {
    emb1 = embeddings.get(word1.word)
    emb2 = embeddings.get(word2.word)
  } else {
    const vocab = vocabulary || buildVocabulary([word1, word2])
    emb1 = generateEmbedding(word1, vocab)
    emb2 = generateEmbedding(word2, vocab)
  }
  
  // PRIMARY: Semantic embedding similarity (70% weight)
  const embeddingSim = cosineSimilarity(emb1, emb2)
  
  // SECONDARY signals (30% weight combined)
  const posSim = getPOSCompatibility(word1.partOfSpeech, word2.partOfSpeech)
  const synSim = getSynonymSimilarity(word1, word2)
  
  // Context similarity from sentences
  const sent1Tokens = new Set()
  ;(word1.sentences || []).forEach((s) =>
    tokenize(s).forEach((t) => sent1Tokens.add(t))
  )
  const sent2Tokens = new Set()
  ;(word2.sentences || []).forEach((s) =>
    tokenize(s).forEach((t) => sent2Tokens.add(t))
  )
  const contextSim = computeJaccard(sent1Tokens, sent2Tokens)
  
  // Weighted combination
  const score =
    embeddingSim * 0.70 +        // PRIMARY: semantic embeddings
    posSim * 0.10 +               // SECONDARY: POS compatibility
    synSim * 0.12 +               // SECONDARY: synonym overlap
    contextSim * 0.08             // SECONDARY: context
  
  return Math.min(Math.max(score, 0), 1)
}

// ============================================================================
// STEP 4: IMPROVED CLUSTERING (NO CHAIN GROUPS)
// ============================================================================

/**
 * Validate that a group has sufficient mutual similarity
 * Prevents "chain" groups where words are only loosely connected
 */
function validateGroup(groupIndices, similarities) {
  if (groupIndices.length < 3) return false
  
  // Check all pairwise similarities
  let minSimilarity = Infinity
  let sumSimilarity = 0
  let pairCount = 0
  
  for (let i = 0; i < groupIndices.length; i++) {
    for (let j = i + 1; j < groupIndices.length; j++) {
      const sim = similarities[groupIndices[i]][groupIndices[j]]
      minSimilarity = Math.min(minSimilarity, sim)
      sumSimilarity += sim
      pairCount++
    }
  }
  
  const avgSimilarity = sumSimilarity / pairCount
  
  // STRICT REQUIREMENTS:
  // 1. No pair can be below minimum threshold (no weak links)
  // 2. Average similarity must be high (cohesive group)
  // 3. Group size limits
  
  const validMinPair = minSimilarity >= CONFIG.MIN_PAIRWISE_SIMILARITY
  const validAvgSim = avgSimilarity >= CONFIG.MIN_GROUP_INTERNAL_SIMILARITY
  const validSize = groupIndices.length >= CONFIG.MIN_GROUP_SIZE && 
                   groupIndices.length <= CONFIG.MAX_GROUP_SIZE
  
  return validMinPair && validAvgSim && validSize
}

/**
 * Find groups using strict mutual-similarity clustering
 * Does NOT use connected components (which create chain groups)
 * Instead uses a quality-first approach
 */
function findGroups(words, similarities) {
  const n = words.length
  if (n < 3) return []
  
  const groups = []
  const used = new Set()
  
  // Sort all pairs by similarity (highest first)
  const pairs = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push({ i, j, sim: similarities[i][j] })
    }
  }
  pairs.sort((a, b) => b.sim - a.sim)
  
  // Start with highest-similarity pairs and try to expand them
  for (const { i: seed1, j: seed2 } of pairs) {
    if (used.has(seed1) || used.has(seed2)) continue
    if (similarities[seed1][seed2] < CONFIG.EMBEDDING_SIMILARITY_THRESHOLD) break
    
    // Start a group with this seed pair
    const candidates = [seed1, seed2]
    
    // Try to add more words to the group
    for (let k = 0; k < n; k++) {
      if (k === seed1 || k === seed2 || used.has(k)) continue
      
      // Check if this word is similar enough to all current members
      let canAdd = true
      for (const member of candidates) {
        if (similarities[k][member] < CONFIG.MIN_PAIRWISE_SIMILARITY) {
          canAdd = false
          break
        }
      }
      
      if (canAdd) {
        candidates.push(k)
      }
    }
    
    // Validate the group
    if (validateGroup(candidates, similarities)) {
      groups.push({
        indices: candidates,
        words: candidates.map((idx) => words[idx]),
        avgSimilarity: candidates.length > 1
          ? candidates.reduce((sum, i) => {
              let pairSum = 0, count = 0
              for (let j = 0; j < candidates.length; j++) {
                if (i !== candidates[j]) {
                  pairSum += similarities[i][candidates[j]]
                  count++
                }
              }
              return sum + (pairSum / count)
            }, 0) / candidates.length
          : 1,
      })
      
      candidates.forEach((idx) => used.add(idx))
    }
  }
  
  return groups
}

// ============================================================================
// STEP 5: PUBLIC API - GROUP SIMILAR WORDS
// ============================================================================

/**
 * Group words by semantic similarity using embeddings and strict clustering
 * Returns an array of groups where each group has 3+ mutually similar words
 */
export function groupSimilarWords(words) {
  if (!words || words.length < 3) return []

  const n = words.length

  // STEP 1: Build vocabulary from all words
  const vocabulary = buildVocabulary(words)

  // STEP 2: Generate embeddings for all words
  const embeddings = new Map()
  words.forEach((word) => {
    embeddings.set(word.word, generateEmbedding(word, vocabulary))
  })

  // STEP 3: Compute comprehensive similarity matrix
  const similarities = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = computeSimilarity(
        words[i],
        words[j],
        embeddings,
        vocabulary
      )
      similarities[i][j] = sim
      similarities[j][i] = sim
    }
  }

  // STEP 4: Find groups using strict mutual-similarity clustering
  const groups = findGroups(words, similarities)

  // STEP 5: Sort by average similarity (best first)
  groups.sort((a, b) => b.avgSimilarity - a.avgSimilarity)

  return groups.map(({ words: groupWords, avgSimilarity }) => ({
    words: groupWords,
    avgSimilarity,
  }))
}

// ============================================================================
// CONFIGURATION EXPORT
// ============================================================================

/**
 * Get current configuration for debugging and calibration
 */
export function getConfig() {
  return { ...CONFIG }
}

/**
 * Update configuration (use for calibration/testing)
 * Example: updateConfig({ EMBEDDING_SIMILARITY_THRESHOLD: 0.5 })
 */
export function updateConfig(updates) {
  Object.assign(CONFIG, updates)
}
