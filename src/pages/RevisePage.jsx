import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, PartyPopper } from 'lucide-react'
import FlashCard from '../components/FlashCard'
import { rateWord, isDue } from '../lib/srs'

const cardVariants = {
  enter: { opacity: 0, x: 60, scale: 0.95 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -80, scale: 0.92 },
}

/**
 * Revise tab — SRS flashcard session for due words.
 */
export default function RevisePage({ savedWords, onUpdateWord }) {
  const dueWords = useMemo(() => savedWords.filter(isDue), [savedWords])
  const [index, setIndex] = useState(0)
  const [sessionDone, setSessionDone] = useState(false)
  const [direction, setDirection] = useState(1)

  const handleRate = useCallback(
    async (rating) => {
      const current = dueWords[index]
      if (!current) return
      const updated = rateWord(current, rating)
      onUpdateWord(updated)

      // Short delay for animation feel
      await new Promise((r) => setTimeout(r, 200))

      if (index + 1 >= dueWords.length) {
        setSessionDone(true)
      } else {
        setDirection(1)
        setIndex((prev) => prev + 1)
      }
    },
    [dueWords, index, onUpdateWord]
  )

  // No words saved at all
  if (savedWords.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title="No Words Yet"
        subtitle="Go to the Search tab to find and save GRE words to your deck."
      />
    )
  }

  // Session complete
  if (sessionDone || dueWords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
          textAlign: 'center',
          gap: '16px',
        }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: '4rem' }}
        >
          🎉
        </motion.div>
        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: 0,
            background: 'linear-gradient(135deg, #f0f0ff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {sessionDone ? 'Session Complete!' : 'All Caught Up!'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', maxWidth: '320px', lineHeight: 1.6 }}>
          {sessionDone
            ? `You reviewed ${dueWords.length} word${dueWords.length !== 1 ? 's' : ''}. Great job! Come back tomorrow for the next session.`
            : `No words are due for review right now. You have ${savedWords.length} word${savedWords.length !== 1 ? 's' : ''} in your deck — check back later!`}
        </p>
        <div
          style={{
            marginTop: '8px',
            padding: '14px 24px',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          📚 {savedWords.length} words in deck &nbsp;·&nbsp; ✅ {savedWords.filter((w) => !isDue(w)).length} reviewed
        </div>
      </motion.div>
    )
  }

  const currentWord = dueWords[index]

  return (
    <div style={{ padding: '24px 20px 120px', maxWidth: '560px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            margin: '0 0 4px 0',
            background: 'linear-gradient(135deg, #f0f0ff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Revision Session
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
          {dueWords.length} word{dueWords.length !== 1 ? 's' : ''} due today
        </p>
      </motion.div>

      {/* Flashcard with slide transition */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${currentWord.word}-${index}`}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <FlashCard
            word={currentWord}
            onRate={handleRate}
            cardIndex={index}
            totalCards={dueWords.length}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '3.5rem' }}>{icon}</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </motion.div>
  )
}
