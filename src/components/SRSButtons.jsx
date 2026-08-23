import { motion } from 'framer-motion'

const RATINGS = [
  {
    id: 'hard',
    label: 'Hard',
    sublabel: '+1 day',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.35)',
    emoji: '😓',
  },
  {
    id: 'good',
    label: 'Good',
    sublabel: '×2.5',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.35)',
    emoji: '👍',
  },
  {
    id: 'easy',
    label: 'Easy',
    sublabel: '×3.5',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.35)',
    emoji: '🚀',
  },
]

/**
 * Sticky bottom SRS rating buttons shown on the back of a flashcard.
 */
export default function SRSButtons({ onRate, disabled = false }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'var(--bg-card)',
        borderRadius: '0 0 20px 20px',
        flexShrink: 0,
      }}
    >
      {RATINGS.map((r) => (
        <motion.button
          key={r.id}
          id={`srs-btn-${r.id}`}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => !disabled && onRate(r.id)}
          disabled={disabled}
          style={{
            background: r.bg,
            border: `1px solid ${r.border}`,
            borderRadius: '14px',
            padding: '12px 8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{r.emoji}</span>
          <span
            style={{
              color: r.color,
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
            }}
          >
            {r.label}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 500 }}>
            {r.sublabel}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
