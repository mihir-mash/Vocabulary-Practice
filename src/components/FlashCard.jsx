import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioButton from './AudioButton'
import SRSButtons from './SRSButtons'

/**
 * A 3D-flip flashcard for revision.
 * Front: word + phonetic
 * Back: full definition, examples, synonyms, SRS buttons
 */
export default function FlashCard({ word, onRate, cardIndex, totalCards }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRating, setIsRating] = useState(false)

  const handleFlip = () => {
    if (!isRating) setIsFlipped((prev) => !prev)
  }

  const handleRate = async (rating) => {
    setIsRating(true)
    await onRate(rating)
    // Reset for next card
    setIsFlipped(false)
    setIsRating(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* Progress indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '0 4px',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
          {cardIndex + 1} / {totalCards}
        </span>
        <div
          style={{
            flex: 1,
            height: '3px',
            background: 'var(--bg-surface)',
            borderRadius: '999px',
            margin: '0 12px',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
              borderRadius: '999px',
            }}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {totalCards - cardIndex - 1} left
        </span>
      </div>

      {/* Card container */}
      <div
        id="flashcard-container"
        style={{
          perspective: '1000px',
          cursor: isFlipped ? 'default' : 'pointer',
        }}
        onClick={!isFlipped ? handleFlip : undefined}
      >
        <motion.div
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            width: '100%',
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* ── FRONT FACE ── */}
          <div
            id="flashcard-front"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              boxShadow: 'var(--card-shadow)',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 32px',
              gap: '16px',
              position: 'relative',
            }}
          >
            {/* Decorative glow */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                background: 'var(--accent-glow)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                opacity: 0.4,
              }}
            />

            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <motion.h1
                key={word.word}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #f0f0ff, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                {word.word}
              </motion.h1>

              {word.phonetic && (
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    marginTop: '8px',
                    fontStyle: 'italic',
                  }}
                >
                  {word.phonetic}
                </p>
              )}
            </div>

            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                bottom: '24px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Tap to reveal →
            </motion.div>
          </div>

          {/* ── BACK FACE ── */}
          <div
            id="flashcard-back"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              overflow: 'hidden',
            }}
          >
            {/* Scrollable content area */}
            <div
              style={{
                overflowY: 'auto',
                padding: '24px',
                flex: 1,
                maxHeight: '420px',
              }}
            >
              {/* Word header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {word.word}
                </h2>
                <AudioButton audioUrl={word.audioUrl} size="sm" />
              </div>

              {/* Meanings */}
              {(word.allMeanings || []).map((meaning, mi) => (
                <div key={mi} style={{ marginBottom: '16px' }}>
                  <span className="tag tag-pos" style={{ marginBottom: '8px', display: 'inline-block' }}>
                    {meaning.partOfSpeech}
                  </span>
                  {meaning.definitions.map((def, di) => (
                    <div key={di} style={{ marginBottom: '10px' }}>
                      <p
                        style={{
                          color: 'var(--text-primary)',
                          fontSize: '0.92rem',
                          lineHeight: 1.6,
                          margin: '0 0 4px 0',
                        }}
                      >
                        {def.definition}
                      </p>
                      {def.example && (
                        <p
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.82rem',
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                            margin: 0,
                            paddingLeft: '10px',
                            borderLeft: '2px solid var(--border-accent)',
                          }}
                        >
                          "{def.example}"
                        </p>
                      )}
                    </div>
                  ))}
                  {meaning.synonyms?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {meaning.synonyms.map((s, si) => (
                        <span key={si} className="tag tag-synonym">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sticky SRS buttons */}
            <SRSButtons onRate={handleRate} disabled={isRating} />
          </div>
        </motion.div>
      </div>

      {/* Flip hint when not flipped */}
      {!isFlipped && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            marginTop: '16px',
          }}
        >
          Tap the card to see the definition
        </p>
      )}
    </div>
  )
}
