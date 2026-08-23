/**
 * Parse a Free Dictionary API response into a clean word object.
 * @param {Array} data - Raw API JSON array
 * @returns {object} Parsed word data
 */
export function parseApiResponse(data) {
  if (!data || !data.length) return null
  const entry = data[0]

  // Find an audio URL across all entries and phonetics
  let audioUrl = null
  for (const item of data) {
    if (item.phonetics && Array.isArray(item.phonetics)) {
      const found = item.phonetics.find((p) => p.audio && p.audio.trim() !== '')
      if (found) {
        audioUrl = found.audio
        break
      }
    }
  }

  // Collect all meanings
  const meanings = entry.meanings || []

  // Primary meaning: first definition from first meaning group
  const primaryMeaning = meanings[0]
  const partOfSpeech = primaryMeaning?.partOfSpeech || ''
  const primaryDefinition = primaryMeaning?.definitions?.[0]?.definition || ''

  // Collect up to 3 examples across all meanings/definitions
  const examples = []
  for (const meaning of meanings) {
    for (const def of meaning.definitions || []) {
      if (def.example && examples.length < 3) {
        examples.push(def.example)
      }
    }
  }

  // Collect all definitions (for back of card) - up to 3 meanings with their defs
  const allMeanings = meanings.slice(0, 3).map((m) => ({
    partOfSpeech: m.partOfSpeech,
    definitions: m.definitions?.slice(0, 2).map((d) => ({
      definition: d.definition,
      example: d.example || null,
    })) || [],
    synonyms: m.synonyms?.slice(0, 6) || [],
  }))

  // Flatten synonyms from all meanings
  const synonyms = [
    ...new Set(
      meanings.flatMap((m) => [
        ...(m.synonyms || []),
        ...m.definitions?.flatMap((d) => d.synonyms || []),
      ])
    ),
  ].slice(0, 8)

  return {
    word: entry.word,
    phonetic: entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '',
    audioUrl,
    partOfSpeech,
    primaryDefinition,
    examples,
    synonyms,
    allMeanings,
  }
}
