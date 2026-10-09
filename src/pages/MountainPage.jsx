import { useMemo, useState } from 'react'
import { Mountain, Shuffle, ChevronLeft, ChevronRight, Search, Star, Check, Layers } from 'lucide-react'
import vocabulary from '../data/mountainWords.json'
import AudioButton from '../components/AudioButton'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultSRS, getDifficultyBadge, rateWord } from '../lib/srs'
import { normalizeMountainWord as normalize, selectMountainWords, filterMountainWords } from '../lib/mountain'
import './MountainPage.css'

const GROUPS = [...new Set(vocabulary.map(w => w.group))].sort((a, b) => a - b)
function shuffled(words) {
  const result = [...words]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function MountainPage({ activeUsername, savedWords, loadingWords, onSaveWord, onUpdateWord }) {
  const [selectedGroups, setSelectedGroups] = useLocalStorage(`mountain-groups-${activeUsername}`, [1])
  const [mode, setMode] = useState('practice')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [hideMeanings, setHideMeanings] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [order, setOrder] = useState(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [completed, setCompleted] = useState(false)
  const saved = useMemo(() => new Map(savedWords.map(w => [normalize(w.word), w])), [savedWords])
  const selected = useMemo(() => selectMountainWords(vocabulary, selectedGroups), [selectedGroups])
  const visible = useMemo(() => {
    const words = filterMountainWords(selected, saved, filter, query)
    if (!order) return words
    const positions = new Map(order.map((word, i) => [word, i]))
    return [...words].sort((a, b) => positions.get(a.word) - positions.get(b.word))
  }, [selected, saved, query, filter, order])
  // Snapshot the practice round: rating a "new" word must not remove the card
  // underneath the learner and cause the next word to be skipped.
  const [deck, setDeck] = useState(null)
  const practiceDeck = deck ?? visible
  const card = practiceDeck[index]
  const resetView = () => { setDeck(null); setIndex(0); setFlipped(false); setCompleted(false); setOrder(null); setRevealed({}); setStatus('') }
  const toggleGroup = group => {
    setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group].sort((a, b) => a - b))
    resetView()
  }
  const startPractice = () => { setDeck([...visible]); setIndex(0); setFlipped(false); setCompleted(false); setStatus(''); setMode('practice') }
  const next = () => {
    setFlipped(false)
    setDeck(practiceDeck)
    if (index + 1 >= practiceDeck.length) setCompleted(true)
    else setIndex(prev => prev + 1)
  }
  const saveRating = async (entry, difficulty, practice = false) => {
    if (busy || loadingWords) return
    setBusy(true); setStatus('')
    if (practice) setDeck(practiceDeck)
    const existing = saved.get(normalize(entry.word))
    const word = existing || {
      word: entry.word,
      definition: entry.definitions.map(d => d.definition).join('; '),
      definitions: entry.definitions,
      partOfSpeech: [...new Set(entry.definitions.map(d => d.part_of_speech))].join(', '),
      synonyms: [...new Set(entry.definitions.flatMap(d => d.synonyms || []))],
      antonyms: [],
      sentences: entry.definitions.map(d => d.example).filter(Boolean),
      audioUrl: entry.pronunciation_url || '',
      group: entry.group,
      ...defaultSRS(),
      savedAt: new Date().toISOString(),
    }
    try {
      const updated = practice ? rateWord(word, difficulty) : { ...word, difficulty }
      await (existing ? onUpdateWord(updated) : onSaveWord(updated))
      setStatus(`${entry.word} saved as ${difficulty}.`)
      if (practice) next()
    } catch { setStatus('Could not save this word. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <div className="mountain-page">
      <section className="card mountain-groups" aria-label="Select vocabulary groups">
        <div className="mountain-toolbar"><div className="mountain-group-heading"><span className="mountain-group-icon"><Layers size={18} /></span><div><h2>Select groups</h2><p className="mountain-caption">{selectedGroups.length ? `${selectedGroups.length} selected` : 'Choose a group to begin'}</p></div></div><button className="btn btn-ghost" disabled={busy || !selectedGroups.length} onClick={() => { setSelectedGroups([]); resetView() }}>Clear</button></div>
        <div className="mountain-group-grid">{GROUPS.map(group => {
          const count = vocabulary.filter(w => w.group === group && saved.has(normalize(w.word))).length
          const isSelected = selectedGroups.includes(group)
          return <button type="button" key={group} disabled={busy} className={`mountain-group ${isSelected ? 'selected' : ''}`} aria-label={`Group ${group}, ${loadingWords ? 'loading saved count' : `${count} of 30 words in your list`}`} aria-pressed={isSelected} onClick={() => toggleGroup(group)}><span className="mountain-group-number">{group}{isSelected && <Check size={10} aria-hidden="true" />}</span><small>{loadingWords ? '…' : `${count}/30`}</small><span className="mountain-group-progress" aria-hidden="true"><span style={{ width: `${loadingWords ? 0 : count / 30 * 100}%` }} /></span></button>
        })}</div>
        <p className="mountain-caption mountain-group-legend"><Star size={12} aria-hidden="true" /> Counts show words in @{activeUsername}’s List. Each group has 30 words.</p>
      </section>

      <div className="mountain-toolbar mountain-controls">
        <div className="mountain-actions mountain-mode-tabs"><button aria-pressed={mode === 'practice'} className={`btn ${mode === 'practice' ? 'btn-purple' : 'btn-ghost'}`} disabled={busy} onClick={() => { if (mode !== 'practice') startPractice() }}>Practice</button><button aria-pressed={mode === 'words'} className={`btn ${mode === 'words' ? 'btn-purple' : 'btn-ghost'}`} disabled={busy} onClick={() => { setMode('words'); setStatus('') }}>Words</button></div>
        <button className="btn btn-ghost" disabled={!visible.length || busy} onClick={() => { const words = shuffled(visible); setOrder(words.map(w => w.word)); if (mode === 'practice') { setDeck(words); setIndex(0); setFlipped(false); setCompleted(false) } }}><Shuffle size={15} /> Shuffle</button>
      </div>
      <div className="mountain-toolbar mountain-practice-filter"><button type="button" className={`btn ${filter === 'new' ? 'btn-purple' : 'btn-ghost'}`} aria-pressed={filter === 'new'} disabled={busy || loadingWords} onClick={() => { setFilter(prev => prev === 'new' ? 'all' : 'new'); resetView() }}>Only new words</button><span className="mountain-caption">{filter === 'new' ? 'Words outside your List' : 'All words, including saved'}{mode === 'practice' && <span className="mountain-saved-legend"><Star size={12} fill="currentColor" aria-hidden="true" /> In your List</span>}</span></div>
      {mode === 'words' && <>
        <div className="mountain-filters"><label className="mountain-search"><Search size={16} /><input className="field" aria-label="Search selected groups" placeholder="Find a word, meaning, or synonym…" value={query} onChange={e => { setQuery(e.target.value); resetView() }} /></label><select className="field" aria-label="Filter word difficulty" value={filter} onChange={e => { setFilter(e.target.value); resetView() }}>{[['all', 'All words'], ['new', 'New words'], ['hard', 'Hard'], ['medium', 'Medium'], ['easy', 'Easy']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="mountain-toolbar"><p className="mountain-caption">{visible.length} words in {selectedGroups.length} selected groups</p><label className="mountain-caption mountain-check"><input type="checkbox" checked={hideMeanings} onChange={e => { setHideMeanings(e.target.checked); setRevealed({}) }} /> Hide meanings</label></div>
      </>}
      {status && <p role="status" className="mountain-status">{status}</p>}
      {loadingWords && <p className="mountain-caption" role="status">Loading your saved progress…</p>}
      {!selectedGroups.length ? <div className="card mountain-empty"><Mountain size={32} /><h2>Your next climb starts here</h2><p>Select a group above to discover your words.</p></div> : mode === 'words' ? (
        <div className="mountain-word-list">{visible.length === 0 && <div className="card mountain-empty"><p>No words match these filters.</p></div>}{visible.map(entry => {
          const existing = saved.get(normalize(entry.word))
          const show = !hideMeanings || revealed[entry.word]
          return <article className="card mountain-word" key={entry.word}>
            <div className="mountain-toolbar"><div className="mountain-word-title"><h2>{entry.word}</h2><span className="pill-pos">Group {entry.group}</span>{existing && <span className="mountain-caption">{getDifficultyBadge(existing.difficulty).label}</span>}</div><AudioButton word={entry.word} audioUrl={entry.pronunciation_url} size="sm" /></div>
            {hideMeanings ? <MountainFlashcard entry={entry} saved={!!existing && !loadingWords} flipped={!!revealed[entry.word]} onFlip={() => setRevealed(prev => ({ ...prev, [entry.word]: !prev[entry.word] }))} disabled={busy} /> : <Meanings entry={entry} />}
            {show && <Ratings disabled={busy || loadingWords} current={existing?.difficulty} onRate={difficulty => saveRating(entry, difficulty)} />}
          </article>
        })}</div>
      ) : completed ? <div className="card mountain-empty"><Mountain size={36} /><h2>Round complete</h2><p>You explored {practiceDeck.length} words. Keep climbing.</p><button className="btn btn-purple" disabled={loadingWords} onClick={startPractice}>Start another round</button></div> : card ? (
        <section className="mountain-practice" aria-label="Vocabulary flashcards">
          <div className="mountain-toolbar"><span className="pill-pos">Group {card.group}</span><span className="mountain-caption">{index + 1} / {practiceDeck.length}</span><AudioButton word={card.word} audioUrl={card.pronunciation_url} /></div>
          <progress aria-label="Practice progress" value={index + 1} max={practiceDeck.length} />
          <MountainFlashcard entry={card} saved={!loadingWords && saved.has(normalize(card.word))} flipped={flipped} onFlip={() => setFlipped(prev => !prev)} disabled={busy}>
            <Ratings disabled={busy || loadingWords} current={saved.get(normalize(card.word))?.difficulty} onRate={difficulty => saveRating(card, difficulty, true)} />
          </MountainFlashcard>
          <div className="mountain-toolbar mountain-card-nav"><button className="btn btn-ghost" disabled={index === 0 || busy} onClick={() => { setIndex(prev => prev - 1); setFlipped(false) }}><ChevronLeft size={16} /> Previous</button><button className="btn btn-ghost" disabled={busy} onClick={next}>Skip <ChevronRight size={16} /></button></div>
        </section>
      ) : <div className="card mountain-empty"><p>{filter === 'new' ? 'All selected words are already in your List. Turn off “Only new words” to practice them.' : 'No words match your filters. Change your filters in Words.'}</p></div>}
    </div>
  )
}

function SavedStar() {
  return <span className="mountain-saved-star" role="img" aria-label="Already in your List" title="Already in your List"><Star size={19} fill="currentColor" aria-hidden="true" /></span>
}

function MountainFlashcard({ entry, saved, flipped, onFlip, disabled, children }) {
  return <div className="mountain-flip-perspective">
    <div className={`mountain-flip-card ${flipped ? 'is-flipped' : ''}`}>
      <button type="button" className="card mountain-flip-front" disabled={disabled} onClick={onFlip} aria-label={`Flip ${entry.word} to see its meaning`} aria-hidden={flipped} inert={flipped}>
        <span className="mountain-caption">WHAT DOES THIS MEAN?</span>
        <span className="mountain-flip-word">{entry.word}{saved && <SavedStar />}</span>
        <span className="mountain-flip-hint">Tap card to flip</span>
      </button>
      <div className="card mountain-flip-back" aria-hidden={!flipped} inert={!flipped}>
        <div className="mountain-flip-content">
          <div className="mountain-toolbar"><h2>{entry.word}{saved && <SavedStar />}</h2><button type="button" className="btn btn-ghost" disabled={disabled} onClick={onFlip} aria-label={`Flip ${entry.word} back`}>Flip back</button></div>
          <Meanings entry={entry} />
        </div>
        {children && <div className="mountain-flip-footer">{children}</div>}
      </div>
    </div>
  </div>
}

function Meanings({ entry }) {
  return <div className="mountain-meanings">{entry.definitions.map((meaning, i) => <div key={i} className="mountain-meaning"><span className="pill-pos">{meaning.part_of_speech}</span><p>{meaning.definition}</p>{meaning.example && <blockquote>{meaning.example}</blockquote>}<div className="mountain-synonyms">{(meaning.synonyms || []).map(s => <span className="pill-syn" key={s}>{s}</span>)}</div></div>)}</div>
}

function Ratings({ disabled, current, onRate }) {
  return <div className="mountain-ratings" aria-label="Rate word difficulty">{['hard', 'medium', 'easy'].map(d => {
    const badge = getDifficultyBadge(d)
    return <button key={d} className="btn" data-difficulty={d} disabled={disabled} aria-pressed={current === d} onClick={() => onRate(d)} style={{ color: badge.color, background: badge.bg, border: `1px solid ${current === d ? badge.color : badge.border}` }}>{badge.label}</button>
  })}</div>
}
