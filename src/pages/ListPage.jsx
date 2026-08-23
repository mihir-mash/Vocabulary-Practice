import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, ChevronDown, Search, Flame } from 'lucide-react'
import AudioButton from '../components/AudioButton'
import { getDifficultyBadge } from '../lib/srs'

export default function ListPage({ savedWords, onDeleteWord, onClearAll }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [expandedWord, setExpandedWord] = useState(null)

  const filtered = savedWords.filter((w) =>
    w.word.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const toggleExpand = (wordStr) => {
    setExpandedWord((prev) => (prev === wordStr ? null : wordStr))
  }

  const hardCount = savedWords.filter((w) => w.difficulty === 'hard').length
  const easyCount = savedWords.filter((w) => w.difficulty === 'easy').length

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
          Saved Vocabulary
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
          {savedWords.length} word{savedWords.length !== 1 ? 's' : ''} in your collection · Click any word to see details
        </p>
      </div>

      {/* Stats row */}
      {savedWords.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '18px',
        }}>
          {[
            { label: 'Total Words', value: savedWords.length, color: 'var(--text-primary)' },
            { label: 'Hard (Frequent)', value: hardCount, color: '#f87171' },
            { label: 'Mastered', value: easyCount, color: '#34d399' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter search box */}
      {savedWords.length > 2 && (
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Filter words..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="field"
            style={{ padding: '8px 14px 8px 34px', fontSize: '0.85rem', width: '100%' }}
          />
        </div>
      )}

      {/* Empty State */}
      {savedWords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            No saved words yet. Search and save words to manage them here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            No words matching "{searchFilter}".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((word, i) => (
              <ExpandableWordRow
                key={word.word}
                word={word}
                index={i}
                isExpanded={expandedWord === word.word}
                onToggle={() => toggleExpand(word.word)}
                onDelete={() => onDeleteWord(word.word)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Clear All Words */}
      {savedWords.length > 0 && (
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          {!confirmClear ? (
            <button
              id="clear-all-btn"
              onClick={() => setConfirmClear(true)}
              className="btn btn-danger"
              style={{ fontSize: '0.82rem' }}
            >
              <Trash2 size={14} />
              Clear all saved words
            </button>
          ) : (
            <div className="card" style={{ padding: '16px', display: 'inline-flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.85rem' }}>
                <AlertTriangle size={15} />
                Delete all {savedWords.length} words from your collection?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  id="confirm-clear-btn"
                  onClick={() => { onClearAll(); setConfirmClear(false) }}
                  className="btn btn-danger"
                  style={{ fontSize: '0.82rem' }}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ExpandableWordRow({ word, index, isExpanded, onToggle, onDelete }) {
  const badge = getDifficultyBadge(word.difficulty)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, delay: index * 0.015 }}
      className="card"
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        overflow: 'hidden',
        border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Header Bar of the Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        gap: '12px',
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {word.word}
          </span>
          {word.partOfSpeech && (
            <span className="pill-pos">
              {word.partOfSpeech}
            </span>
          )}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '4px',
              color: badge.color,
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            {word.difficulty === 'hard' && <Flame size={10} />}
            {badge.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Delete button (stop propagation so row doesn't toggle) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="btn btn-ghost"
            style={{
              padding: '6px 8px',
              color: '#f87171',
              border: 'none',
              background: 'transparent',
            }}
            title={`Delete ${word.word}`}
            aria-label={`Delete ${word.word}`}
          >
            <Trash2 size={15} />
          </button>

          {/* Expand indicator icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </div>

      {/* Expanded Description Accordion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              padding: '14px 16px 16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Audio & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AudioButton word={word.word} audioUrl={word.audioUrl} size="sm" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Practiced {word.reviewCount || 0} time{(word.reviewCount || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Definition */}
            {word.definition && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  {word.definition}
                </p>
              </div>
            )}

            {/* Example Sentences */}
            {word.sentences && word.sentences.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                  Example Sentences
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {word.sentences.map((s, i) => (
                    <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', fontStyle: 'italic', lineHeight: 1.5, margin: 0, paddingLeft: '10px', borderLeft: '2px solid var(--border-strong)' }}>
                      "{s}"
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms */}
            {word.synonyms && word.synonyms.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                  Synonyms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {word.synonyms.map((s, i) => (
                    <span key={i} className="pill-syn">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {word.antonyms && word.antonyms.length > 0 && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                  Antonyms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {word.antonyms.map((a, i) => (
                    <span key={i} className="pill-syn" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
