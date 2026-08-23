import { motion } from 'framer-motion'

const RATINGS = [
  {
    id: 'hard',
    label: 'Hard',
    sublabel: 'Reset to 1d',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
  },
  {
    id: 'good',
    label: 'Good',
    sublabel: '×2.5 interval',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'easy',
    label: 'Easy',
    sublabel: '×3.5 interval',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
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
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        borderRadius: '0 0 18px 18px',
        flexShrink: 0,
      }}
    >
      {RATINGS.map((r) => (
        <motion.button
          key={r.id}
          id={`srs-btn-${r.id}`}
          whileTap={{ scale: 0.97 }}
          onClick={() => !disabled && onRate(r.id)}
          disabled={disabled}
          style={{
            background: r.bg,
            border: `1px solid ${r.border}`,
            borderRadius: '10px',
            padding: '10px 6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            transition: 'background 0.15s',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span
            style={{
              color: r.color,
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {r.label}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 500 }}>
            {r.sublabel}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
