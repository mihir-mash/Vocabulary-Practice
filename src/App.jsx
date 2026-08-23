import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocalStorage } from './hooks/useLocalStorage'
import { isDue } from './lib/srs'
import BottomNav from './components/BottomNav'
import SearchPage from './pages/SearchPage'
import RevisePage from './pages/RevisePage'
import SettingsPage from './pages/SettingsPage'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('search')
  const [savedWords, setSavedWords] = useLocalStorage('vocab-srs-words', [])

  // Derived: how many words are due today
  const dueCount = useMemo(() => savedWords.filter(isDue).length, [savedWords])

  const handleSaveWord = useCallback(
    (wordData) => {
      setSavedWords((prev) => {
        const exists = prev.some((w) => w.word.toLowerCase() === wordData.word.toLowerCase())
        if (exists) return prev
        return [...prev, wordData]
      })
    },
    [setSavedWords]
  )

  const handleUpdateWord = useCallback(
    (updatedWord) => {
      setSavedWords((prev) =>
        prev.map((w) =>
          w.word.toLowerCase() === updatedWord.word.toLowerCase() ? updatedWord : w
        )
      )
    },
    [setSavedWords]
  )

  const handleDeleteWord = useCallback(
    (word) => {
      setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== word.toLowerCase()))
    },
    [setSavedWords]
  )

  const handleClearAll = useCallback(() => {
    setSavedWords([])
  }, [setSavedWords])

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          right: '-15%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: '60px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <SearchPage savedWords={savedWords} onSaveWord={handleSaveWord} />
            </motion.div>
          )}
          {activeTab === 'revise' && (
            <motion.div
              key="revise"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <RevisePage savedWords={savedWords} onUpdateWord={handleUpdateWord} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <SettingsPage
                savedWords={savedWords}
                onDeleteWord={handleDeleteWord}
                onClearAll={handleClearAll}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} dueCount={dueCount} />
    </div>
  )
}
