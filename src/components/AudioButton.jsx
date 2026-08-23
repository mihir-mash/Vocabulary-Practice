import { Volume2 } from 'lucide-react'

/**
 * Plays pronunciation audio for a word using API audio or Web Speech API fallback.
 */
export default function AudioButton({ word, audioUrl, size = 'md' }) {
  const speakFallback = (text) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('SpeechSynthesis fallback error:', e)
    }
  }

  const handlePlay = (e) => {
    e.stopPropagation()

    if (audioUrl && audioUrl.trim()) {
      let url = audioUrl.trim()
      if (url.startsWith('//')) url = 'https:' + url

      if (url.startsWith('http')) {
        const audio = new Audio(url)
        audio.play().catch(() => {
          speakFallback(word)
        })
        return
      }
    }

    speakFallback(word)
  }

  const dims = { sm: 14, md: 16, lg: 20 }
  const pad  = { sm: '5px', md: '7px', lg: '9px' }

  return (
    <button
      id="audio-play-btn"
      type="button"
      onClick={handlePlay}
      title={`Pronounce ${word || 'word'}`}
      aria-label={`Pronounce ${word || 'word'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad[size] || '7px',
        borderRadius: '50%',
        border: '1px solid var(--pill-pos-border)',
        background: 'var(--pill-pos-bg)',
        color: 'var(--pill-pos-text)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      <Volume2 size={dims[size] || 16} />
    </button>
  )
}
