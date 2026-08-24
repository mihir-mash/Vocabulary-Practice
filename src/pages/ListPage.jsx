import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, ChevronDown, Search, Flame, CloudUpload, User, CheckCircle2, Loader2 } from 'lucide-react'
import AudioButton from '../components/AudioButton'
import { getDifficultyBadge } from '../lib/srs'

export default function ListPage({
  savedWords,
  loadingWords,
  onDeleteWord,
  onClearAll,
  activeUsername,
  onUsernameChange,
  localWords,
  onMigrateLocalWords,
}) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [expandedWord, setExpandedWord] = useState(null)
  
  // Username editing state
  const [usernameInput, setUsernameInput] = useState(activeUsername || 'mihir')
  
  // Migration state
  const [isMigrating, setIsMigrating] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null) // { success: boolean, message: string }

  const handleApplyUsername = (e) => {
    e?.preventDefault()
    const trimmed = usernameInput.trim().toLowerCase()
    if (!trimmed) return
    onUsernameChange(trimmed)
    setSyncStatus({ success: true, message: `Switched account to '@${trimmed}'` })
    setTimeout(() => setSyncStatus(null), 3000)
  }

  const handleSyncLocalWords = async () => {
    setIsMigrating(true)
    setSyncStatus(null)
    try {
      const count = await onMigrateLocalWords()
      setSyncStatus({
        success: true,
        message: `Successfully synced ${count} words to cloud account '@${activeUsername || 'mihir'}'!`,
      })
    } catch (err) {
      console.error('Migration error:', err)
      setSyncStatus({
        success: false,
        message: `Sync failed: ${err.message}`,
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const filtered = savedWords.filter((w) =>
    (w.word || '').toLowerCase().includes(searchFilter.toLowerCase())
  )

  const toggleExpand = (wordStr) => {
    setExpandedWord((prev) => (prev === wordStr ? null : wordStr))
  }

  const hardCount = savedWords.filter((w) => w.difficulty === 'hard').length
  const easyCount = savedWords.filter((w) => w.difficulty === 'easy').length

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '640px', margin: '0 auto' }}>
      
      {/* ── Account & Firestore Sync Settings Card ── */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px', border: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <User size={18} style={{ color: 'var(--accent-light)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Account Settings
          </h2>
        </div>

        {/* Username Switcher Form */}
        <form onSubmit={handleApplyUsername} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              @
            </span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="enter username (e.g. mihir)"
              className="field"
              style={{ padding: '8px 12px 8px 28px', fontSize: '0.85rem', width: '100%' }}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <button
            type="submit"
            disabled={!usernameInput.trim() || usernameInput.trim().toLowerCase() === (activeUsername || '').toLowerCase()}
            className="btn btn-purple"
            style={{ fontSize: '0.8rem', padding: '8px 14px', flexShrink: 0 }}
          >
            Switch
          </button>
        </form>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
          Connected to Firestore collection: <code style={{ color: 'var(--accent-light)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>users/{activeUsername || 'mihir'}/words</code>
        </p>

        {/* Local to Cloud Migration Banner */}
        {localWords && localWords.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(217, 119, 6, 0.1)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CloudUpload size={18} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {localWords.length} Browser Words Ready for Cloud Sync
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              Migrate your local vocabulary deck into your cloud account (<strong>@{activeUsername || 'mihir'}</strong>) so it is safely backed up in Firestore.
            </p>
            <button
              onClick={handleSyncLocalWords}
              disabled={isMigrating}
              className="btn btn-purple"
              style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', padding: '9px 16px' }}
            >
              {isMigrating ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} />
                  Syncing {localWords.length} words to cloud...
                </>
              ) : (
                <>
                  <CloudUpload size={16} />
                  Sync Local Words to Cloud ({activeUsername || 'mihir'})
                </>
              )}
            </button>
          </div>
        )}

        {/* Toast / Status Alert */}
        <AnimatePresence>
          {syncStatus && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: syncStatus.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${syncStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: syncStatus.success ? '#34d399' : '#f87171',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{syncStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Vocabulary List Header ── */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
          Cloud Vocabulary Deck
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
          {loadingWords ? 'Fetching from Firestore...' : `${savedWords.length} word${savedWords.length !== 1 ? 's' : ''} in cloud account @${activeUsername || 'mihir'}`}
        </p>
      </div>

      {/* Loading Indicator */}
      {loadingWords && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Loading your words from Firestore...</p>
        </div>
      )}

      {/* Stats row */}
      {!loadingWords && savedWords.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '18px',
        }}>
          {[
            { label: 'Total Words', value: savedWords.length, color: 'var(--text-primary)' },
            { label: 'Hard (Frequent)', value: hardCount, color: '#f87171' },
            { label: 'Mastered', value: easyCount, color: '#34d399' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter search box */}
      {!loadingWords && savedWords.length > 2 && (
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Filter words..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="field"
            style={{ padding: '8px 14px 8px 34px', fontSize: '0.85rem', width: '100%' }}
          />
        </div>
      )}

      {/* Empty State */}
      {!loadingWords && savedWords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            No cloud words yet for <strong>@{activeUsername || 'mihir'}</strong>. Search and save words, or sync your browser words above!
          </p>
        </div>
      ) : !loadingWords && filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            No words matching "{searchFilter}".
          </p>
        </div>
      ) : !loadingWords && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((word, i) => (
              <ExpandableWordRow
                key={word.word}
                word={word}
                index={i}
                isExpanded={expandedWord === word.word}
                onToggle={() => toggleExpand(word.word)}
                onDelete={() => onDeleteWord(word.word)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Clear All Words */}
      {!loadingWords && savedWords.length > 0 && (
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          {!confirmClear ? (
            <button
              id="clear-all-btn"
              onClick={() => setConfirmClear(true)}
              className="btn btn-danger"
              style={{ fontSize: '0.82rem' }}
            >
              <Trash2 size={14} />
              Clear all words from account @{activeUsername || 'mihir'}
            </button>
          ) : (
            <div className="card" style={{ padding: '16px', display: 'inline-flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.85rem' }}>
                <AlertTriangle size={15} />
                Delete all {savedWords.length} words from account @{activeUsername || 'mihir'} in Firestore?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  id="confirm-clear-btn"
                  onClick={() => { onClearAll(); setConfirmClear(false) }}
                  className="btn btn-danger"
                  style={{ fontSize: '0.82rem' }}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ExpandableWordRow({ word, index, isExpanded, onToggle, onDelete }) {
  const badge = getDifficultyBadge(word.difficulty)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, delay: index * 0.015 }}
      className="card"
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        overflow: 'hidden',
        border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Header Bar of the Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        gap: '12px',
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {word.word}
          </span>
          {word.partOfSpeech && (
            <span className="pill-pos">
              {word.partOfSpeech}
            </span>
          )}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '4px',
              color: badge.color,
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            {word.difficulty === 'hard' && <Flame size={10} />}
            {badge.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Delete button (stop propagation so row doesn't toggle) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="btn btn-ghost"
            style={{
              padding: '6px 8px',
              color: '#f87171',
              border: 'none',
              background: 'transparent',
            }}
            title={`Delete ${word.word}`}
            aria-label={`Delete ${word.word}`}
          >
            <Trash2 size={15} />
          </button>

          {/* Expand indicator icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </div>

      {/* Expanded Description Accordion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              padding: '14px 16px 16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Audio & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AudioButton word={word.word} audioUrl={word.audioUrl} size="sm" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Practiced {word.reviewCount || 0} time{(word.reviewCount || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Definition */}
            {word.definition && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  {word.definition}
                </p>
              </div>
            )}

            {/* Example Sentences */}
            {word.sentences && word.sentences.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>
                  Example Sentences
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {word.sentences.map((s, i) => (
                    <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', fontStyle: 'italic', lineHeight: 1.5, margin: 0, paddingLeft: '10px', borderLeft: '2px solid var(--border-strong)' }}>
                      "{s}"
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms */}
            {word.synonyms && word.synonyms.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                  Synonyms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {word.synonyms.map((s, i) => (
                    <span key={i} className="pill-syn">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {word.antonyms && word.antonyms.length > 0 && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                  Antonyms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {word.antonyms.map((a, i) => (
                    <span key={i} className="pill-syn" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
