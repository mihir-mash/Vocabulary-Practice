import { Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * A small button that plays the pronunciation audio for a word.
 */
export default function AudioButton({ audioUrl, size = 'md' }) {
  if (!audioUrl) return null

  const handlePlay = (e) => {
    e.stopPropagation()
    // Ensure URL has a protocol
    const url = audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl
    const audio = new Audio(url)
    audio.play().catch((err) => console.warn('Audio playback failed:', err))
  }

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const iconSizes = { sm: 14, md: 16, lg: 20 }

  return (
    <motion.button
      id="audio-play-btn"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handlePlay}
      className={`${sizeClasses[size]} rounded-full cursor-pointer`}
      style={{
        background: 'rgba(124, 58, 237, 0.2)',
        border: '1px solid rgba(124, 58, 237, 0.35)',
        color: '#a78bfa',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="Play pronunciation"
      aria-label="Play pronunciation"
    >
      <Volume2 size={iconSizes[size]} />
    </motion.button>
  )
}
