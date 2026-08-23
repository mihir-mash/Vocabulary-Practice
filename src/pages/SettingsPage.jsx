import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { formatReviewDate, isDue } from '../lib/srs'

/**
 * Settings/Manage page — view all saved words, see their SRS status, delete them.
 */
export default function SettingsPage({ savedWords, onDeleteWord, onClearAll }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  const filtered = savedWords.filter((w) =>
    w.word.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div style={{ padding: '24px 20px 120px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: '0 0 4px 0',
            background: 'linear-gradient(135deg, #f0f0ff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          My Word List
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
          {savedWords.length} word{savedWords.length !== 1 ? 's' : ''} saved
        </p>
      </motion.div>

      {/* Stats bar */}
      {savedWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: 'Total', value: savedWords.length, color: '#c4b5fd', bg: 'rgba(124,58,237,0.15)' },
            {
              label: 'Due',
              value: savedWords.filter(isDue).length,
              color: '#fca5a5',
              bg: 'rgba(239,68,68,0.12)',
            },
            {
              label: 'Reviewed',
              value: savedWords.filter((w) => !isDue(w)).length,
              color: '#6ee7b7',
              bg: 'rgba(16,185,129,0.12)',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: stat.bg,
                border: `1px solid ${stat.color}33`,
                borderRadius: '14px',
                padding: '14px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter input */}
      {savedWords.length > 3 && (
        <motion.input
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          type="text"
          placeholder="Filter words..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="input-field"
          style={{ padding: '11px 16px', marginBottom: '16px', fontSize: '0.9rem' }}
        />
      )}

      {/* Word list */}
      {savedWords.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗂️</div>
          <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            No words saved yet.
            <br />
            Go to Search to add your first word!
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map((word, i) => (
            <WordRow
              key={word.word}
              word={word}
              index={i}
              onDelete={() => onDeleteWord(word.word)}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Clear All */}
      {savedWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '24px', textAlign: 'center' }}
        >
          {!confirmClear ? (
            <button
              id="clear-all-btn"
              onClick={() => setConfirmClear(true)}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px',
                color: '#fca5a5',
                padding: '10px 20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={14} />
              Clear All Words
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5' }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Delete all {savedWords.length} words?
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  id="confirm-clear-btn"
                  onClick={() => { onClearAll(); setConfirmClear(false) }}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function WordRow({ word, index, onDelete }) {
  const due = isDue(word)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        marginBottom: '8px',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {word.word}
          </span>
          {word.partOfSpeech && (
            <span className="tag tag-pos" style={{ flexShrink: 0 }}>
              {word.partOfSpeech}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: due ? '#fca5a5' : '#6ee7b7',
            }}
          >
            {formatReviewDate(word.nextReviewDate)}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            Interval: {word.interval}d
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        style={{
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px',
          color: '#fca5a5',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          flexShrink: 0,
        }}
        title={`Delete "${word.word}"`}
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  )
}
