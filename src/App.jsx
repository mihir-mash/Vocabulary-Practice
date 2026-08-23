import { useState, useCallback, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { isDue } from './lib/srs'
import SearchPage from './pages/SearchPage'
import RevisePage from './pages/RevisePage'
import SettingsPage from './pages/SettingsPage'

const TABS = [
  { id: 'search',   label: 'Search' },
  { id: 'revise',   label: 'Revise' },
  { id: 'settings', label: 'List'   },
]

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1,  y: 0  },
  exit:    { opacity: 0,  y: -6 },
}

export default function App() {
  const [activeTab, setActiveTab]   = useState('search')
  const [savedWords, setSavedWords] = useLocalStorage('vocab-srs-words', [])
  const [theme, setTheme]           = useLocalStorage('vocab-srs-theme', 'sunny')

  // Apply theme to html root tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'sunny' ? 'dark' : 'sunny'))
  }

  const dueCount = useMemo(() => savedWords.filter(isDue).length, [savedWords])

  const handleSaveWord = useCallback((wordData) => {
    setSavedWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === wordData.word.toLowerCase())
      return exists ? prev : [...prev, wordData]
    })
  }, [setSavedWords])

  const handleUpdateWord = useCallback((updatedWord) => {
    setSavedWords((prev) =>
      prev.map((w) =>
        w.word.toLowerCase() === updatedWord.word.toLowerCase() ? updatedWord : w
      )
    )
  }, [setSavedWords])

  const handleDeleteWord = useCallback((word) => {
    setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== word.toLowerCase()))
  }, [setSavedWords])

  const handleClearAll = useCallback(() => setSavedWords([]), [setSavedWords])

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              vocab
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-light)',
              background: 'var(--pill-pos-bg)',
              border: '1px solid var(--pill-pos-border)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              SRS
            </span>
          </div>

          {/* Right section: Tabs + Theme switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tab bar */}
            <nav style={{ display: 'flex', gap: '2px' }}>
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
                    {/* Due badge */}
                    {id === 'revise' && dueCount > 0 && (
                      <span style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        lineHeight: 1.4,
                      }}>
                        {dueCount > 99 ? '99+' : dueCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
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
                  <span style={{ color: '#fbbf24' }}>Sunny</span>
                </>
              ) : (
                <>
                  <Moon size={15} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
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
              <RevisePage savedWords={savedWords} onUpdateWord={handleUpdateWord} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
              <SettingsPage savedWords={savedWords} onDeleteWord={handleDeleteWord} onClearAll={handleClearAll} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
