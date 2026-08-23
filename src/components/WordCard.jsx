import { motion } from 'framer-motion'
import { BookmarkPlus, Check } from 'lucide-react'
import AudioButton from './AudioButton'

/**
 * Displays the search result from the dictionary API with an option to save.
 */
export default function WordCard({ wordData, isSaved, onSave }) {
  return (
    <motion.div
      id="word-result-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-card"
      style={{ padding: '24px', marginTop: '20px' }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                margin: 0,
                background: 'linear-gradient(135deg, #f0f0ff, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {wordData.word}
            </h2>
            <AudioButton audioUrl={wordData.audioUrl} />
          </div>
          {wordData.phonetic && (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                margin: '4px 0 0 0',
                fontStyle: 'italic',
              }}
            >
              {wordData.phonetic}
            </p>
          )}
        </div>

        {/* Save button */}
        <motion.button
          id="save-word-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          disabled={isSaved}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: isSaved ? 'default' : 'pointer',
            background: isSaved
              ? 'rgba(16, 185, 129, 0.2)'
              : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: isSaved ? '#6ee7b7' : 'white',
            boxShadow: isSaved ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          {isSaved ? (
            <>
              <Check size={15} />
              Saved
            </>
          ) : (
            <>
              <BookmarkPlus size={15} />
              Save
            </>
          )}
        </motion.button>
      </div>

      {/* Meanings */}
      {(wordData.allMeanings || []).map((meaning, mi) => (
        <div
          key={mi}
          style={{
            marginBottom: '18px',
            paddingBottom: mi < wordData.allMeanings.length - 1 ? '18px' : 0,
            borderBottom:
              mi < wordData.allMeanings.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <span className="tag tag-pos" style={{ marginBottom: '10px', display: 'inline-block' }}>
            {meaning.partOfSpeech}
          </span>

          {meaning.definitions.map((def, di) => (
            <div key={di} style={{ marginBottom: di < meaning.definitions.length - 1 ? '12px' : 0 }}>
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  margin: '0 0 6px 0',
                }}
              >
                {def.definition}
              </p>
              {def.example && (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    lineHeight: 1.55,
                    margin: 0,
                    paddingLeft: '12px',
                    borderLeft: '2px solid var(--border-accent)',
                  }}
                >
                  "{def.example}"
                </p>
              )}
            </div>
          ))}

          {/* Synonyms */}
          {meaning.synonyms?.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: '0 0 6px 0',
                }}
              >
                Synonyms
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {meaning.synonyms.map((s, si) => (
                  <span key={si} className="tag tag-synonym">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  )
}
