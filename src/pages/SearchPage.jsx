import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, AlertCircle } from 'lucide-react'
import WordCard from '../components/WordCard'
import { defaultSRS } from '../lib/srs'

export default function SearchPage({ savedWords, onSaveWord, onMissingKey }) {
  const [query, setQuery]       = useState('')
  const [wordData, setWordData] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const groqKey = import.meta.env.VITE_GROQ_API_KEY
  const [toast, setToast]       = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault()
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return

    if (!groqKey) {
      setError('VITE_GROQ_API_KEY is not configured in .env')
      return
    }

    setLoading(true)
    setError(null)
    setWordData(null)
    try {
      const payload = {
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'You are an expert GRE vocabulary tutor. Output ONLY a valid JSON object with this exact structure and no other text: {"word": "string", "partOfSpeech": "string", "definition": "string", "sentences": ["string", "string"], "synonyms": ["string"], "antonyms": ["string"]}'
          },
          { role: 'user', content: `Analyze the GRE word: ${trimmed}` }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `Groq API error (${res.status})`)
      }
      const data = await res.json()
      const contentStr = data.choices?.[0]?.message?.content ?? ''

      // Robust JSON extraction between the first { and last }
      const firstBrace = contentStr.indexOf('{')
      const lastBrace = contentStr.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error('Model did not return valid JSON. Please try again.')
      }

      const jsonCandidate = contentStr.substring(firstBrace, lastBrace + 1)
      const parsed = JSON.parse(jsonCandidate)

      const required = ['word', 'partOfSpeech', 'definition']
      for (const f of required) {
        if (!parsed[f]) throw new Error(`Missing "${f}" in response`)
      }

      const wordObj = {
        word: parsed.word || trimmed,
        partOfSpeech: parsed.partOfSpeech || '',
        definition: parsed.definition || '',
        sentences: Array.isArray(parsed.sentences) ? parsed.sentences : [],
        synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms : [],
        antonyms: Array.isArray(parsed.antonyms) ? parsed.antonyms : [],
        audioUrl: '',
        ...defaultSRS(),
        savedAt: new Date().toISOString()
      }
      setWordData(wordObj)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [query, groqKey])

  const handleSave = () => {
    if (!wordData) return
    const alreadySaved = savedWords.some(
      (w) => w.word.toLowerCase() === wordData.word.toLowerCase()
    )
    if (alreadySaved) {
      showToast(`"${wordData.word}" is already saved.`, 'warn')
      return
    }
    onSaveWord({ ...wordData, ...defaultSRS(), savedAt: new Date().toISOString() })
    showToast(`"${wordData.word}" added to your list.`, 'success')
  }

  const isSaved = wordData
    ? savedWords.some((w) => w.word.toLowerCase() === wordData.word.toLowerCase())
    : false

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* Page title */}
      <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
        Look up a word
      </h1>

      {/* Search bar */}
      <form id="search-form" onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{
            position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. ephemeral, garrulous..."
            className="field"
            style={{ padding: '10px 36px 10px 38px' }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
          />
          {query && (
            <button type="button"
              onClick={() => { setQuery(''); setWordData(null); setError(null) }}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          id="search-submit-btn"
          type="submit"
          disabled={loading || !query.trim()}
          className="btn btn-purple"
          style={{ flexShrink: 0, minWidth: '72px', justifyContent: 'center' }}
        >
          {loading
            ? <Loader2 size={15} style={{ animation: 'spin 0.9s linear infinite' }} />
            : 'Search'
          }
        </button>
      </form>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '20px' }}
          >
            Looking up <em>"{query}"</em>…
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: '16px',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
            }}
          >
            <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence mode="wait">
        {wordData && !loading && (
          <WordCard key={wordData.word} wordData={wordData} isSaved={isSaved} onSave={handleSave} />
        )}
      </AnimatePresence>

      {/* Empty hint */}
      {!wordData && !loading && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '36px', lineHeight: 1.7 }}>
          Search any English word to see its definition, examples, and synonyms,
          then save it to your spaced repetition deck.
        </p>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: 12, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{   opacity: 0, y: 12,  x: '-50%' }}
            style={{
              position: 'fixed', bottom: '28px', left: '50%',
              zIndex: 200,
              background: toast.type === 'success' ? '#065f46'
                        : toast.type === 'warn'    ? '#78350f'
                        :                            '#4c1d95',
              border: `1px solid ${toast.type === 'success' ? '#059669' : toast.type === 'warn' ? '#d97706' : '#7c3aed'}`,
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 500,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
