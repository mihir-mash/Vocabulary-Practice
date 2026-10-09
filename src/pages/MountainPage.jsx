import { useMemo, useState } from 'react'
import { Mountain, Shuffle, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import vocabulary from '../data/mountainWords.json'
import AudioButton from '../components/AudioButton'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultSRS, getDifficultyBadge, rateWord } from '../lib/srs'
import './MountainPage.css'

const GROUPS = [...new Set(vocabulary.map(w => w.group))].sort((a, b) => a - b)
const normalize = word => word.trim().toLowerCase()
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
  const [mode, setMode] = useState('words')
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
  const selected = useMemo(() => {
    const seen = new Set()
    return vocabulary.filter(w => {
      const word = normalize(w.word)
      if (!selectedGroups.includes(w.group) || seen.has(word)) return false
      seen.add(word)
      return true
    })
  }, [selectedGroups])
  const visible = useMemo(() => {
    const words = selected.filter(w => {
      const entry = saved.get(normalize(w.word))
      const matchesStatus = filter === 'all' || (filter === 'new' ? !entry : entry?.difficulty === filter)
      return matchesStatus && (!query || [w.word, ...w.definitions.flatMap(d => [d.definition, d.example, ...(d.synonyms || [])])].join(' ').toLowerCase().includes(query.toLowerCase()))
    })
    if (!order) return words
    const positions = new Map(order.map((word, i) => [word, i]))
    return [...words].sort((a, b) => positions.get(a.word) - positions.get(b.word))
  }, [selected, saved, query, filter, order])
  // Snapshot the practice round: rating a "new" word must not remove the card
  // underneath the learner and cause the next word to be skipped.
  const [deck, setDeck] = useState([])
  const card = deck[index]
  const learned = selected.filter(w => saved.has(normalize(w.word))).length
  const resetView = () => { setIndex(0); setFlipped(false); setCompleted(false); setMode('words'); setOrder(null); setRevealed({}); setStatus('') }
  const toggleGroup = group => {
    setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group].sort((a, b) => a - b))
    resetView()
  }
  const startPractice = () => { setDeck([...visible]); setIndex(0); setFlipped(false); setCompleted(false); setStatus(''); setMode('practice') }
  const next = () => {
    setFlipped(false)
    if (index + 1 >= deck.length) setCompleted(true)
    else setIndex(prev => prev + 1)
  }
  const saveRating = async (entry, difficulty, practice = false) => {
    if (busy || loadingWords) return
    setBusy(true); setStatus('')
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
      <div className="mountain-heading">
        <div><span className="mountain-eyebrow"><Mountain size={16} /> ONE GROUP AT A TIME</span><h1>Climb your vocab mountain</h1><p>34 groups. 1,020 words. Build your vocabulary at your own pace.</p></div>
        <span className="pill-pos">{learned} / {selected.length} saved</span>
      </div>
      <section className="card mountain-groups" aria-label="Select vocabulary groups">
        <div className="mountain-toolbar"><h2>Select groups</h2><div className="mountain-actions"><button className="btn btn-ghost" onClick={() => { setSelectedGroups(GROUPS); resetView() }}>All</button><button className="btn btn-ghost" onClick={() => { setSelectedGroups([]); resetView() }}>Clear</button></div></div>
        <div className="mountain-group-grid">{GROUPS.map(group => {
          const count = vocabulary.filter(w => w.group === group && saved.has(normalize(w.word))).length
          return <button type="button" key={group} className={`mountain-group ${selectedGroups.includes(group) ? 'selected' : ''}`} aria-pressed={selectedGroups.includes(group)} onClick={() => toggleGroup(group)}><strong>{group}</strong><small>{count}/30</small></button>
        })}</div>
        <p className="mountain-caption">Choose one or more groups. Rate a word to add it to List and Revise.</p>
      </section>

      <div className="mountain-toolbar mountain-controls">
        <div className="mountain-actions"><button className={`btn ${mode === 'words' ? 'btn-purple' : 'btn-ghost'}`} onClick={() => { setMode('words'); setStatus('') }}>Words</button><button className={`btn ${mode === 'practice' ? 'btn-purple' : 'btn-ghost'}`} disabled={!visible.length || busy || loadingWords} onClick={startPractice}>Practice</button></div>
        <button className="btn btn-ghost" disabled={!visible.length || busy} onClick={() => { const words = shuffled(visible); setOrder(words.map(w => w.word)); if (mode === 'practice') { setDeck(words); setIndex(0); setFlipped(false); setCompleted(false) } }}><Shuffle size={15} /> Shuffle</button>
      </div>
      {mode === 'words' && <>
        <div className="mountain-filters"><label className="mountain-search"><Search size={16} /><input className="field" aria-label="Search selected groups" placeholder="Find a word, meaning, or synonym…" value={query} onChange={e => setQuery(e.target.value)} /></label><select className="field" aria-label="Filter word difficulty" value={filter} onChange={e => setFilter(e.target.value)}>{[['all', 'All words'], ['new', 'New words'], ['hard', 'Hard'], ['medium', 'Medium'], ['easy', 'Easy']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
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
            {show ? <Meanings entry={entry} /> : <button className="btn btn-ghost mountain-reveal" onClick={() => setRevealed(prev => ({ ...prev, [entry.word]: true }))}>Reveal meaning</button>}
            {show && <Ratings disabled={busy || loadingWords} current={existing?.difficulty} onRate={difficulty => saveRating(entry, difficulty)} />}
          </article>
        })}</div>
      ) : completed ? <div className="card mountain-empty"><Mountain size={36} /><h2>Round complete</h2><p>You explored {deck.length} words. Keep climbing.</p><button className="btn btn-purple" disabled={loadingWords} onClick={startPractice}>Start another round</button></div> : card ? (
        <section className="card mountain-flashcard">
          <div className="mountain-toolbar"><span className="pill-pos">Group {card.group}</span><span className="mountain-caption">{index + 1} / {deck.length}</span><AudioButton word={card.word} audioUrl={card.pronunciation_url} /></div>
          <progress aria-label="Practice progress" value={index} max={deck.length} />
          <h2>{card.word}</h2>
          {flipped ? <><Meanings entry={card} /><p className="mountain-caption">How well do you know this word?</p><Ratings disabled={busy || loadingWords} onRate={difficulty => saveRating(card, difficulty, true)} /></> : <button className="btn btn-purple" onClick={() => setFlipped(true)}>Reveal meaning</button>}
          <div className="mountain-toolbar mountain-card-nav"><button className="btn btn-ghost" disabled={index === 0 || busy} onClick={() => { setIndex(prev => prev - 1); setFlipped(false) }}><ChevronLeft size={16} /> Previous</button><button className="btn btn-ghost" disabled={busy} onClick={next}>Skip <ChevronRight size={16} /></button></div>
        </section>
      ) : <div className="card mountain-empty"><p>No words to practice. Change your filters in Words.</p></div>}
    </div>
  )
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
