import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FlashCard from '../components/FlashCard'
import { rateWord, isDue } from '../lib/srs'

const cardVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export default function RevisePage({ savedWords, onUpdateWord }) {
  // Initialize session with current due words
  const [sessionDeck, setSessionDeck] = useState(() => savedWords.filter(isDue))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // Total cards in this session
  const totalCards = sessionDeck.length

  const handleRate = useCallback(
    async (rating) => {
      const current = sessionDeck[currentIndex]
      if (!current) return

      const updated = rateWord(current, rating)
      onUpdateWord(updated)

      await new Promise((r) => setTimeout(r, 180))

      const nextIndex = currentIndex + 1
      setReviewedCount((c) => c + 1)

      if (nextIndex >= sessionDeck.length) {
        setIsFinished(true)
      } else {
        setCurrentIndex(nextIndex)
      }
    },
    [sessionDeck, currentIndex, onUpdateWord]
  )

  const handlePracticeAll = () => {
    setSessionDeck([...savedWords])
    setCurrentIndex(0)
    setReviewedCount(0)
    setIsFinished(false)
  }

  if (savedWords.length === 0) {
    return (
      <EmptyState
        title="No words saved"
        subtitle="Use the Search tab to look up GRE vocabulary and add words to your deck."
      />
    )
  }

  if (isFinished || totalCards === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          {isFinished ? 'Session finished' : 'All caught up! 🎉'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px 0', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {isFinished
            ? `Reviewed ${reviewedCount} word${reviewedCount !== 1 ? 's' : ''}. Check back later for your next scheduled review.`
            : `No words are currently due for review out of ${savedWords.length} total in your deck.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{
            padding: '12px 18px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}>
            {savedWords.length} total in deck &nbsp;·&nbsp; {savedWords.filter((w) => !isDue(w)).length} up to date
          </div>

          {savedWords.length > 0 && (
            <button
              onClick={handlePracticeAll}
              className="btn btn-ghost"
              style={{ marginTop: '8px', fontSize: '0.85rem' }}
            >
              Practice entire deck anyway
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  const currentWord = sessionDeck[currentIndex]
  if (!currentWord) return null

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
          Flashcards
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
          {totalCards - currentIndex} word{totalCards - currentIndex !== 1 ? 's' : ''} remaining in session
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentWord.word}-${currentIndex}`}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <FlashCard
            word={currentWord}
            onRate={handleRate}
            cardIndex={currentIndex}
            totalCards={totalCards}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem', maxWidth: '320px', lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </motion.div>
  )
}
