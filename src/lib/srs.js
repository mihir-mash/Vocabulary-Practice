/**
 * SRS (Spaced Repetition System) — SM-2 lite algorithm
 */

/**
 * Default SRS state for a newly saved word.
 */
export function defaultSRS() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return {
    nextReviewDate: today.toISOString(),
    interval: 0,
    easeFactor: 2.5,
  }
}

/**
 * Compute the new SRS state after rating a word.
 * @param {object} word - The current word object with SRS fields
 * @param {'hard'|'good'|'easy'} rating
 * @returns {object} Updated word with new SRS fields
 */
export function rateWord(word, rating) {
  const multipliers = { hard: 1, good: 2.5, easy: 3.5 }
  const multiplier = multipliers[rating]

  let newInterval
  if (word.interval === 0) {
    newInterval = 1
  } else {
    newInterval = Math.max(1, Math.round(word.interval * multiplier))
  }

  // Adjust ease factor slightly
  const easeDeltas = { hard: -0.15, good: 0, easy: 0.1 }
  const newEaseFactor = Math.max(1.3, (word.easeFactor || 2.5) + easeDeltas[rating])

  const nextReview = new Date()
  nextReview.setHours(0, 0, 0, 0)
  nextReview.setDate(nextReview.getDate() + newInterval)

  return {
    ...word,
    interval: newInterval,
    easeFactor: parseFloat(newEaseFactor.toFixed(2)),
    nextReviewDate: nextReview.toISOString(),
  }
}

/**
 * Check if a word is due for review today.
 * @param {object} word
 * @returns {boolean}
 */
export function isDue(word) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reviewDate = new Date(word.nextReviewDate)
  reviewDate.setHours(0, 0, 0, 0)
  return reviewDate <= today
}

/**
 * Format a date string to a human-readable label.
 * @param {string} isoString
 * @returns {string}
 */
export function formatReviewDate(isoString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(isoString)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Due now'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays} days`
}
