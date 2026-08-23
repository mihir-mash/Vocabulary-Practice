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

      {/* Meanings / Definition */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Part of speech + definition */}
        {(wordData.partOfSpeech || wordData.definition) && (
          <div>
            {wordData.partOfSpeech && (
              <span className="pill-pos" style={{ marginBottom: '10px', display: 'inline-block' }}>
                {wordData.partOfSpeech}
              </span>
            )}
            {wordData.definition && (
              <p style={{ color: 'var(--text-primary)', fontSize: '0.93rem', lineHeight: 1.65, margin: 0 }}>
                {wordData.definition}
              </p>
            )}
          </div>
        )}

        {/* Example sentences */}
        {wordData.sentences && wordData.sentences.length > 0 && (
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
              Example Sentences
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {wordData.sentences.map((s, i) => (
                <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontStyle: 'italic', lineHeight: 1.55, margin: 0, paddingLeft: '12px', borderLeft: '2px solid var(--border-strong)' }}>
                  "{s}"
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Synonyms */}
        {wordData.synonyms && wordData.synonyms.length > 0 && (
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
              Synonyms
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {wordData.synonyms.map((s, i) => (
                <span key={i} className="pill-syn">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Antonyms */}
        {wordData.antonyms && wordData.antonyms.length > 0 && (
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
              Antonyms
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {wordData.antonyms.map((a, i) => (
                <span key={i} className="pill-syn" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>{a}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  )
}
