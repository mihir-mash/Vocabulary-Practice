import { motion } from 'framer-motion'
import { BookmarkPlus, Check } from 'lucide-react'
import AudioButton from './AudioButton'

export default function WordCard({ wordData, isSaved, onSave }) {
  return (
    <motion.div
      id="word-result-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="card"
      style={{ marginTop: '20px', overflow: 'hidden' }}
    >
      {/* Word header strip */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {wordData.word}
            </h2>
            <AudioButton word={wordData.word} audioUrl={wordData.audioUrl} />
          </div>
          {wordData.phonetic && (
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              margin: '5px 0 0 0',
              fontStyle: 'italic',
            }}>
              {wordData.phonetic}
            </p>
          )}
        </div>

        <button
          id="save-word-btn"
          onClick={onSave}
          disabled={isSaved}
          className={`btn ${isSaved ? 'btn-ghost' : 'btn-purple'}`}
          style={{ flexShrink: 0 }}
        >
          {isSaved ? <><Check size={14} /> Saved</> : <><BookmarkPlus size={14} /> Save</>}
        </button>
      </div>

      {/* Meanings */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(wordData.allMeanings || []).map((meaning, mi) => (
          <div key={mi}>
            <span className="pill-pos" style={{ marginBottom: '10px', display: 'inline-block' }}>
              {meaning.partOfSpeech}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {meaning.definitions.map((def, di) => (
                <div key={di}>
                  <p style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.93rem',
                    lineHeight: 1.65,
                    margin: 0,
                  }}>
                    {def.definition}
                  </p>
                  {def.example && (
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.84rem',
                      fontStyle: 'italic',
                      lineHeight: 1.55,
                      margin: '6px 0 0 0',
                      paddingLeft: '12px',
                      borderLeft: '2px solid var(--border-strong)',
                    }}>
                      "{def.example}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            {meaning.synonyms?.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <p style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  margin: '0 0 6px 0',
                }}>
                  Synonyms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {meaning.synonyms.map((s, si) => (
                    <span key={si} className="pill-syn">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
