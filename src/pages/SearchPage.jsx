import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, AlertCircle } from 'lucide-react'
import WordCard from '../components/WordCard'
import { parseApiResponse } from '../lib/dictionary'
import { defaultSRS } from '../lib/srs'

/**
 * Search & Add page — users look up words and save them to their list.
 */
export default function SearchPage({ savedWords, onSaveWord }) {
  const [query, setQuery] = useState('')
  const [wordData, setWordData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault()
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setWordData(null)

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error(`"${trimmed}" was not found in the dictionary.`)
        throw new Error('Something went wrong. Please try again.')
      }
      const data = await res.json()
      const parsed = parseApiResponse(data)
      if (!parsed) throw new Error('Could not parse response for this word.')
      setWordData(parsed)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleSave = () => {
    if (!wordData) return
    const alreadySaved = savedWords.some(
      (w) => w.word.toLowerCase() === wordData.word.toLowerCase()
    )
    if (alreadySaved) {
      showToast(`"${wordData.word}" is already in your list!`, 'warn')
      return
    }
    onSaveWord({ ...wordData, ...defaultSRS(), savedAt: new Date().toISOString() })
    showToast(`"${wordData.word}" saved! 🎉`, 'success')
  }

  const isSaved = wordData
    ? savedWords.some((w) => w.word.toLowerCase() === wordData.word.toLowerCase())
    : false

  return (
    <div style={{ padding: '24px 20px 120px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '28px' }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: '0 0 6px 0',
            background: 'linear-gradient(135deg, #f0f0ff, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          GRE Vocabulary
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
          Search a word and add it to your revision list.
        </p>
      </motion.div>

      {/* Search form */}
      <motion.form
        id="search-form"
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a word..."
            className="input-field"
            style={{ padding: '14px 50px 14px 46px', fontSize: '1rem' }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setWordData(null); setError(null) }}
              style={{
                position: 'absolute',
                right: '50px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          )}
          <button
            id="search-submit-btn"
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary"
            style={{
              position: 'absolute',
              right: '6px',
              padding: '9px 16px',
              fontSize: '0.85rem',
              opacity: !query.trim() ? 0.5 : 1,
              cursor: !query.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Go'}
          </button>
        </div>
      </motion.form>

      {/* Spinner overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px 0',
              gap: '12px',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.9rem' }}>Looking up "{query}"...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '20px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word result */}
      <AnimatePresence mode="wait">
        {wordData && !loading && (
          <WordCard key={wordData.word} wordData={wordData} isSaved={isSaved} onSave={handleSave} />
        )}
      </AnimatePresence>

      {/* Empty state hint */}
      {!wordData && !loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📚</div>
          <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Type a GRE word above to look it up
            <br />
            and add it to your spaced repetition deck.
          </p>
        </motion.div>
      )}

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '90px',
              left: '50%',
              zIndex: 200,
              background:
                toast.type === 'success'
                  ? 'rgba(16,185,129,0.9)'
                  : toast.type === 'warn'
                  ? 'rgba(245,158,11,0.9)'
                  : 'rgba(124,58,237,0.9)',
              color: 'white',
              padding: '12px 22px',
              borderRadius: '14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
