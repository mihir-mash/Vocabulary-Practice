import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle } from 'lucide-react'
import { formatReviewDate, isDue } from '../lib/srs'

export default function SettingsPage({ savedWords, onDeleteWord, onClearAll }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  const filtered = savedWords.filter((w) =>
    w.word.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
          Saved Vocabulary
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
          {savedWords.length} word{savedWords.length !== 1 ? 's' : ''} in your local collection
        </p>
      </div>

      {savedWords.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '18px',
        }}>
          {[
            { label: 'Total Deck', value: savedWords.length },
            { label: 'Due Now', value: savedWords.filter(isDue).length },
            { label: 'Up to Date', value: savedWords.filter((w) => !isDue(w)).length },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {savedWords.length > 3 && (
        <input
          type="text"
          placeholder="Filter saved words..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="field"
          style={{ padding: '8px 14px', marginBottom: '14px', fontSize: '0.85rem' }}
        />
      )}

      {savedWords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            No saved words yet. Search and save words to manage them here.
          </p>
        </div>
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

      {savedWords.length > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {!confirmClear ? (
            <button
              id="clear-all-btn"
              onClick={() => setConfirmClear(true)}
              className="btn btn-danger"
            >
              <Trash2 size={14} />
              Clear all saved words
            </button>
          ) : (
            <div className="card" style={{ padding: '16px', display: 'inline-flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.85rem' }}>
                <AlertTriangle size={15} />
                Delete all {savedWords.length} words from local storage?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  id="confirm-clear-btn"
                  onClick={() => { onClearAll(); setConfirmClear(false) }}
                  className="btn btn-danger"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="btn btn-ghost"
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

function WordRow({ word, index, onDelete }) {
  const due = isDue(word)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        marginBottom: '6px',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {word.word}
          </span>
          {word.partOfSpeech && (
            <span className="pill-pos">
              {word.partOfSpeech}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', color: due ? '#f87171' : 'var(--text-muted)' }}>
            {formatReviewDate(word.nextReviewDate)}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            Interval: {word.interval}d
          </span>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="btn btn-ghost"
        style={{ padding: '6px 8px', color: '#f87171', border: 'none', background: 'transparent' }}
        title={`Delete ${word.word}`}
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}
