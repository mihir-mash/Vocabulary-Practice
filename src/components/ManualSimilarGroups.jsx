import { useMemo, useState } from 'react'
import { Plus, X, Trash2, Search } from 'lucide-react'
import './ManualSimilarGroups.css'

const wordKey = word => String(word || '').trim().toLowerCase()

export default function ManualSimilarGroups({ words, groups, onCreateGroup, onUpdateGroup, onDeleteGroup }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [addingTo, setAddingTo] = useState(null)
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return words.filter(word => wordKey(word.word).includes(needle)).slice(0, 30)
  }, [words, query])
  const toggle = word => setSelected(prev => prev.some(item => wordKey(item.word) === wordKey(word.word))
    ? prev.filter(item => wordKey(item.word) !== wordKey(word.word))
    : [...prev, word])
  const create = () => {
    const unique = [...new Map(selected.map(word => [wordKey(word.word), word])).values()]
    if (unique.length < 2) return
    onCreateGroup(unique)
    setSelected([]); setQuery('')
  }
  const addToGroup = group => {
    const existing = new Set(group.words.map(wordKey))
    const additions = selected.filter(word => !existing.has(wordKey(word.word)))
    if (additions.length) onUpdateGroup(group.id, [...group.words, ...additions])
    setSelected([]); setAddingTo(null); setQuery('')
  }
  return <section className="manual-similar card">
    <div className="manual-similar-heading"><div><h2>Manual groups</h2><p>Choose words and keep your own groups separate from automatic matches.</p></div></div>
    <div className="manual-similar-search"><Search size={16} aria-hidden="true" /><input className="field" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your saved words" aria-label="Search words for a manual group" /></div>
    {results.length > 0 && <div className="manual-word-results">{results.map(word => <button type="button" key={wordKey(word.word)} className={`manual-word-result ${selected.some(item => wordKey(item.word) === wordKey(word.word)) ? 'selected' : ''}`} onClick={() => toggle(word)}>{word.word}<span>{selected.some(item => wordKey(item.word) === wordKey(word.word)) ? 'Selected' : 'Add'}</span></button>)}</div>}
    <div className="manual-similar-actions"><button type="button" className="btn btn-purple" disabled={selected.length < 2} onClick={create}><Plus size={15} /> Create group ({selected.length})</button>{addingTo && <button type="button" className="btn btn-ghost" onClick={() => addToGroup(addingTo)}>Add selected to group</button>}</div>
    {groups.length === 0 ? <p className="manual-similar-empty">No manual groups yet.</p> : <div className="manual-group-list">{groups.map(group => <div className="manual-group" key={group.id}><div className="manual-group-words">{group.words.map(word => <span className="pill-syn" key={wordKey(word)}>{word}<button type="button" aria-label={`Remove ${word} from manual group`} onClick={() => onUpdateGroup(group.id, group.words.filter(item => wordKey(item) !== wordKey(word)))}><X size={12} /></button></span>)}</div><div className="manual-group-actions"><button type="button" className="btn btn-ghost" onClick={() => setAddingTo(group)}>Add words</button><button type="button" className="btn btn-danger" onClick={() => onDeleteGroup(group.id)}><Trash2 size={14} /> Delete</button></div></div>)}</div>}
  </section>
}
