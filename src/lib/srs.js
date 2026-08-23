/**
 * Priority-based Vocabulary Practice System
 * Hard words are prioritized and appear before Medium and Easy words in each round.
 */

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function defaultSRS() {
  return {
    difficulty: 'medium', // 'hard' | 'medium' | 'easy'
    reviewCount: 0,
    lastReviewed: null,
  }
}

/**
 * Update word difficulty after user rates it.
 * @param {object} word 
 * @param {'hard'|'medium'|'good'|'easy'} rating 
 */
export function rateWord(word, rating) {
  const normRating = rating === 'good' ? 'medium' : rating

  return {
    ...word,
    difficulty: normRating,
    reviewCount: (word.reviewCount || 0) + 1,
    lastReviewed: new Date().toISOString(),
  }
}

/**
 * Generate a prioritized practice deck:
 * - Hard words appear FIRST (shuffled among themselves)
 * - Medium words appear NEXT (shuffled among themselves)
 * - Easy words appear LAST (shuffled among themselves)
 * Each saved word appears once per round.
 * @param {Array} words 
 * @returns {Array} Ordered round deck
 */
export function buildPracticeDeck(words) {
  if (!words || words.length === 0) return []

  const hardWords = words.filter((w) => w.difficulty === 'hard')
  const mediumWords = words.filter((w) => !w.difficulty || w.difficulty === 'medium')
  const easyWords = words.filter((w) => w.difficulty === 'easy')

  return [
    ...shuffle(hardWords),
    ...shuffle(mediumWords),
    ...shuffle(easyWords),
  ]
}

/**
 * Format difficulty status for display
 */
export function getDifficultyBadge(difficulty) {
  switch (difficulty) {
    case 'hard':
      return { label: 'Hard', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' }
    case 'easy':
      return { label: 'Easy', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' }
    case 'medium':
    default:
      return { label: 'Medium', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' }
  }
}
