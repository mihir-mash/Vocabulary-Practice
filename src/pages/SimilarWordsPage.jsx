import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { groupSimilarWords } from '../lib/similarity'
import SimilarWordsGroup from '../components/SimilarWordsGroup'

export default function SimilarWordsPage({ savedWords, loadingWords }) {
  const [expandedGroupIndex, setExpandedGroupIndex] = useState(null)
  const [selectedWord, setSelectedWord] = useState(null)

  console.log('SimilarWordsPage rendered', { savedWords: savedWords?.length, loadingWords })

  // Compute groups from saved words
  const groups = useMemo(() => {
    if (!savedWords || savedWords.length < 3) return []
    try {
      console.log('Computing groups for', savedWords.length, 'words')
      const result = groupSimilarWords(savedWords)
      console.log('Found', result.length, 'groups')
      return result
    } catch (error) {
      console.error('Error computing word groups:', error)
      return []
    }
  }, [savedWords])

  const toggleGroup = (index) => {
    setExpandedGroupIndex((prev) => (prev === index ? null : index))
  }

  const handleWordClick = (word) => {
    setSelectedWord(word)
  }

  // ── Loading state ────────────────────────────────────────────────
  if (loadingWords) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <Loader2
          size={24}
          style={{ animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }}
        />
        <p style={{ fontSize: '0.88rem', margin: 0 }}>Computing word similarities...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── No words saved ──────────────────────────────────────────────
  if (!savedWords || savedWords.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.88rem', margin: 0 }}>
          No words saved yet. Use the Search tab to add words and discover word groups.
        </p>
      </div>
    )
  }

  // ── Not enough words for groups ────────────────────────────────────
  if (groups.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.88rem', margin: 0 }}>
          You have {savedWords.length} word{savedWords.length !== 1 ? 's' : ''}, but groups
          need at least 3 semantically similar words.
          <br />
          Keep adding more words to see groups appear!
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: '0 0 4px 0',
            color: 'var(--text-primary)',
          }}
        >
          Similar Words
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
          {groups.length} group{groups.length !== 1 ? 's' : ''} of related words • Click
          to expand
        </p>
      </div>

      {/* Groups grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence mode="popLayout">
          {groups.map((group, index) => (
            <SimilarWordsGroup
              key={`group-${index}`}
              group={group}
              index={index}
              isExpanded={expandedGroupIndex === index}
              onToggle={() => toggleGroup(index)}
              onWordClick={handleWordClick}
              selectedWord={selectedWord}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Word Detail Modal / Sidebar */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWord(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40,
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxHeight: '90vh',
                background: 'var(--bg-card)',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                borderTop: '1px solid var(--border-strong)',
                padding: '24px 20px',
                overflowY: 'auto',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <WordDetailPanel word={selectedWord} onClose={() => setSelectedWord(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WordDetailPanel({ word, onClose }) {
  return (
    <div>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          padding: '6px 10px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        Close
      </button>

      {/* Word header */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            margin: '0 0 4px 0',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {word.word}
        </h2>
        {word.partOfSpeech && (
          <span className="pill-pos" style={{ marginRight: '8px' }}>
            {word.partOfSpeech}
          </span>
        )}
      </div>

      {/* Definition */}
      {word.definition && (
        <div style={{ marginBottom: '16px' }}>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              margin: '0 0 6px 0',
            }}
          >
            Definition
          </p>
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {word.definition}
          </p>
        </div>
      )}

      {/* Example Sentences */}
      {word.sentences && word.sentences.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              margin: '0 0 6px 0',
            }}
          >
            Example Sentences
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {word.sentences.map((s, i) => (
              <p
                key={i}
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: '12px',
                  borderLeft: '2px solid var(--border-strong)',
                }}
              >
                "{s}"
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Synonyms */}
      {word.synonyms && word.synonyms.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              margin: '0 0 6px 0',
            }}
          >
            Synonyms
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {word.synonyms.map((s, i) => (
              <span key={i} className="pill-syn">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Antonyms */}
      {word.antonyms && word.antonyms.length > 0 && (
        <div>
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              margin: '0 0 6px 0',
            }}
          >
            Antonyms
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {word.antonyms.map((a, i) => (
              <span
                key={i}
                className="pill-syn"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#f87171',
                  borderColor: 'rgba(239,68,68,0.2)',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
