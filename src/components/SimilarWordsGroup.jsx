import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function SimilarWordsGroup({
  group,
  index,
  isExpanded,
  onToggle,
  onWordClick,
  selectedWord,
}) {
  const groupLabel = group.words.slice(0, 3).map((w) => w.word).join(', ')
  const hasMore = group.words.length > 3

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      {/* Group Bubble Header */}
      <div
        onClick={onToggle}
        style={{
          background: 'var(--bg-card)',
          border: isExpanded
            ? '2px solid var(--accent-light)'
            : '1px solid var(--border-strong)',
          borderRadius: '14px',
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Group preview text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {groupLabel}
            {hasMore && (
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {' '}
                +{group.words.length - 3}
              </span>
            )}
          </p>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {group.words.length} words • Similarity: {(group.avgSimilarity * 100).toFixed(0)}%
          </p>
        </div>

        {/* Chevron indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              overflow: 'hidden',
              marginTop: '8px',
            }}
          >
            {/* Word cards grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
              }}
            >
              {group.words.map((word) => {
                const isSelected =
                  selectedWord && selectedWord.word === word.word
                return (
                  <motion.div
                    key={word.word}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onWordClick(word)}
                    style={{
                      background: isSelected
                        ? 'var(--pill-pos-bg)'
                        : 'var(--bg-surface)',
                      border: isSelected
                        ? `2px solid var(--accent-light)`
                        : '1px solid var(--border-strong)',
                      borderRadius: '12px',
                      padding: '12px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: isSelected
                          ? 'var(--pill-pos-text)'
                          : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {word.word}
                    </div>
                    {word.partOfSpeech && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: isSelected
                            ? 'var(--pill-pos-text)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {word.partOfSpeech}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
