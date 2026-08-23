import { useState } from 'react'
import { motion } from 'framer-motion'
import AudioButton from './AudioButton'
import SRSButtons from './SRSButtons'

export default function FlashCard({ word, onRate, cardIndex, totalCards }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRating,  setIsRating]  = useState(false)

  const handleFlip = () => { if (!isRating) setIsFlipped((p) => !p) }

  const handleRate = async (rating) => {
    setIsRating(true)
    await onRate(rating)
    setIsFlipped(false)
    setIsRating(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', minWidth: '28px' }}>
          {cardIndex + 1}/{totalCards}
        </span>
        <div style={{ flex: 1, height: '3px', background: 'var(--bg-surface)', borderRadius: '999px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
            transition={{ duration: 0.35 }}
            style={{
              height: '100%',
              background: 'var(--accent)',
              borderRadius: '999px',
            }}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', minWidth: '40px', textAlign: 'right' }}>
          {totalCards - cardIndex - 1} left
        </span>
      </div>

      {/* 3-D card wrapper */}
      <div
        id="flashcard-container"
        style={{ perspective: '1000px', cursor: isFlipped ? 'default' : 'pointer' }}
        onClick={!isFlipped ? handleFlip : undefined}
      >
        <motion.div
          style={{ position: 'relative', transformStyle: 'preserve-3d', width: '100%' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* ── FRONT ── */}
          <div
            id="flashcard-front"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '18px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 28px',
              gap: '10px',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0 }}>
              What does this mean?
            </p>
            <h1 style={{
              fontSize: 'clamp(2rem, 9vw, 3.2rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.05,
            }}>
              {word.word}
            </h1>
            {word.phonetic && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                {word.phonetic}
              </p>
            )}

            <p style={{
              position: 'absolute',
              bottom: '18px',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              margin: 0,
            }}>
              tap to reveal
            </p>
          </div>

          {/* ── BACK ── */}
          <div
            id="flashcard-back"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: 0, left: 0, right: 0,
              overflow: 'hidden',
            }}
          >
            {/* Scrollable definition area */}
            <div style={{ overflowY: 'auto', padding: '20px 20px 12px', maxHeight: '360px' }}>

              {/* Word + audio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {word.word}
                </h2>
                <AudioButton word={word.word} audioUrl={word.audioUrl} size="sm" />
              </div>

              {(word.allMeanings || []).map((meaning, mi) => (
                <div key={mi} style={{ marginBottom: '16px' }}>
                  <span className="pill-pos" style={{ marginBottom: '8px', display: 'inline-block' }}>
                    {meaning.partOfSpeech}
                  </span>
                  {meaning.definitions.map((def, di) => (
                    <div key={di} style={{ marginBottom: '10px' }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                        {def.definition}
                      </p>
                      {def.example && (
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontStyle: 'italic',
                          lineHeight: 1.5,
                          margin: '5px 0 0 0',
                          paddingLeft: '10px',
                          borderLeft: '2px solid var(--border-strong)',
                        }}>
                          "{def.example}"
                        </p>
                      )}
                    </div>
                  ))}
                  {meaning.synonyms?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                      {meaning.synonyms.map((s, si) => (
                        <span key={si} className="pill-syn">{s}</span>
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
    </div>
  )
}
