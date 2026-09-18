import { useState, useCallback, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon, User, Menu, X } from 'lucide-react'
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { useLocalStorage } from './hooks/useLocalStorage'
import SearchPage from './pages/SearchPage'
import RevisePage from './pages/RevisePage'
import ListPage from './pages/ListPage'
import SimilarWordsPage from './pages/SimilarWordsPage'

const TABS = [
  { id: 'search', label: 'Search' },
  { id: 'revise', label: 'Revise' },
  { id: 'similar', label: 'Similar' },
  { id: 'list',   label: 'List'   },
]

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1,  y: 0  },
  exit:    { opacity: 0,  y: -6 },
}

export default function App() {
  const [activeTab, setActiveTab]           = useState('search')
  const [activeUsername, setActiveUsername] = useLocalStorage('activeUsername', 'mihir')
  const [_localWords]                       = useLocalStorage('vocab-srs-words', [])
  const [savedWords, setSavedWords]         = useState([])
  const [loadingWords, setLoadingWords]     = useState(true)
  const [theme, setTheme]                   = useLocalStorage('vocab-srs-theme', 'sunny')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Apply theme to html root tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Subscribe to activeUsername's Firestore collection: users/{activeUsername}/words
  useEffect(() => {
    const cleanUsername = (activeUsername || 'mihir').trim().toLowerCase()
    if (!cleanUsername) return

    setLoadingWords(true)
    const wordsRef = collection(db, 'users', cleanUsername, 'words')

    const unsubscribe = onSnapshot(
      wordsRef,
      (snapshot) => {
        const words = snapshot.docs.map((docSnap) => docSnap.data())
        setSavedWords(words)
        setLoadingWords(false)
      },
      (err) => {
        console.error('Firestore snapshot error:', err)
        setLoadingWords(false)
      }
    )

    return () => unsubscribe()
  }, [activeUsername])

  const _hardCount = useMemo(() => savedWords.filter((w) => w.difficulty === 'hard').length, [savedWords])

  // Save new word to Firestore
  const handleSaveWord = useCallback(async (wordData) => {
    const cleanUsername = (activeUsername || 'mihir').trim().toLowerCase()
    const wordId = (wordData.word || '').trim().toLowerCase()
    if (!wordId) return

    const wordRef = doc(db, 'users', cleanUsername, 'words', wordId)
    await setDoc(wordRef, wordData, { merge: true })
  }, [activeUsername])

  // Update existing word (e.g. SRS difficulty/ratings) in Firestore
  const handleUpdateWord = useCallback(async (updatedWord) => {
    const cleanUsername = (activeUsername || 'mihir').trim().toLowerCase()
    const wordId = (updatedWord.word || '').trim().toLowerCase()
    if (!wordId) return

    const wordRef = doc(db, 'users', cleanUsername, 'words', wordId)
    await setDoc(wordRef, updatedWord, { merge: true })
  }, [activeUsername])

  // Delete single word from Firestore
  const handleDeleteWord = useCallback(async (word) => {
    const cleanUsername = (activeUsername || 'mihir').trim().toLowerCase()
    const wordId = (word || '').trim().toLowerCase()
    if (!wordId) return

    const wordRef = doc(db, 'users', cleanUsername, 'words', wordId)
    await deleteDoc(wordRef)
  }, [activeUsername])

  // Clear all words from active user's Firestore collection
  const handleClearAll = useCallback(async () => {
    const cleanUsername = (activeUsername || 'mihir').trim().toLowerCase()
    if (savedWords.length === 0) return

    const chunkSize = 450
    for (let i = 0; i < savedWords.length; i += chunkSize) {
      const chunk = savedWords.slice(i, i + chunkSize)
      const batch = writeBatch(db)
      chunk.forEach((w) => {
        const wordId = (w.word || '').trim().toLowerCase()
        if (wordId) {
          const wordRef = doc(db, 'users', cleanUsername, 'words', wordId)
          batch.delete(wordRef)
        }
      })
      await batch.commit()
    }
  }, [activeUsername, savedWords])

  // Sync LocalStorage words to Firestore under activeUsername
  const handleMigrateLocalWords = useCallback(async () => {
    if (!_localWords || _localWords.length === 0) return 0
    const cleanUsername = (activeUsername || 'mihir').trim().toLowerCase()

    const chunkSize = 450
    for (let i = 0; i < _localWords.length; i += chunkSize) {
      const chunk = _localWords.slice(i, i + chunkSize)
      const batch = writeBatch(db)
      chunk.forEach((w) => {
        const wordId = (w.word || '').trim().toLowerCase()
        if (wordId) {
          const wordRef = doc(db, 'users', cleanUsername, 'words', wordId)
          batch.set(wordRef, w, { merge: true })
        }
      })
      await batch.commit()
    }
    return _localWords.length
  }, [activeUsername, _localWords])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', transition: 'background-color 0.25s ease' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Vocab
            </span>

            {/* Account pill */}
            <button
              onClick={() => setActiveTab('list')}
              title={`Active Account: @${activeUsername || 'mihir'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <User size={12} style={{ color: 'var(--accent-light)' }} />
              <span>@{activeUsername || 'mihir'}</span>
            </button>
          </div>

          {/* Right section: Desktop nav + Theme + Mobile menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Desktop tab bar (hidden on mobile) */}
            <nav id="desktop-nav" style={{ display: 'flex', gap: '2px' }}>
              {TABS.map(({ id, label }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    id={`nav-${id}`}
                    onClick={() => setActiveTab(id)}
                    style={{
                      position: 'relative',
                      padding: '6px 13px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'var(--pill-pos-bg)' : 'transparent',
                      color: isActive ? 'var(--accent-light)' : 'var(--text-muted)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {label}
                    {/* Hard words indicator badge */}
                    {id === 'revise' && savedWords.filter((w) => w.difficulty === 'hard').length > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        lineHeight: 1.4,
                      }}>
                        {savedWords.filter((w) => w.difficulty === 'hard').length > 99 ? '99+' : savedWords.filter((w) => w.difficulty === 'hard').length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme((prev) => (prev === 'sunny' ? 'dark' : 'sunny'))}
              title={`Switch to ${theme === 'sunny' ? 'Dark' : 'Sunny'} theme`}
              aria-label={`Switch to ${theme === 'sunny' ? 'Dark' : 'Sunny'} theme`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-surface)',
                color: theme === 'sunny' ? '#f59e0b' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {theme === 'sunny' ? (
                <>
                  <Sun size={15} style={{ color: '#f59e0b' }} />
                  <span id="theme-label">Sunny</span>
                </>
              ) : (
                <>
                  <Moon size={15} />
                  <span id="theme-label">Dark</span>
                </>
              )}
            </button>

            {/* Mobile hamburger menu button (visible on mobile) */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 12px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-primary)',
              }}
            >
              {TABS.map(({ id, label }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id)
                      setMobileMenuOpen(false)
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'var(--pill-pos-bg)' : 'transparent',
                      color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    {label}
                    {id === 'revise' && savedWords.filter((w) => w.difficulty === 'hard').length > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        display: 'inline-block',
                      }}>
                        {savedWords.filter((w) => w.difficulty === 'hard').length > 99 ? '99+' : savedWords.filter((w) => w.difficulty === 'hard').length}
                      </span>
                    )}
                  </button>
                )
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div key="search" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <SearchPage savedWords={savedWords} onSaveWord={handleSaveWord} />
            </motion.div>
          )}
          {activeTab === 'revise' && (
            <motion.div key="revise" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <RevisePage savedWords={savedWords} onUpdateWord={handleUpdateWord} loadingWords={loadingWords} />
            </motion.div>
          )}
          {activeTab === 'similar' && (
            <motion.div key="similar" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <SimilarWordsPage savedWords={savedWords} loadingWords={loadingWords} />
            </motion.div>
          )}
          {activeTab === 'list' && (
            <motion.div key="list" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <ListPage
                savedWords={savedWords}
                loadingWords={loadingWords}
                onDeleteWord={handleDeleteWord}
                onClearAll={handleClearAll}
                activeUsername={activeUsername}
                onUsernameChange={setActiveUsername}
                localWords={_localWords}
                onMigrateLocalWords={handleMigrateLocalWords}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
