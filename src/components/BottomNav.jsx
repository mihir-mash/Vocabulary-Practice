import { motion } from 'framer-motion'
import { Search, Layers, List } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'revise', label: 'Revise', icon: Layers },
  { id: 'list',   label: 'List',   icon: List },
]

/**
 * Mobile bottom navigation bar.
 */
export default function BottomNav({ activeTab, onTabChange, dueCount }) {
  return (
    <nav
      id="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(13, 13, 20, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => onTabChange(id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{ position: 'relative', minWidth: '72px', background: 'none', border: 'none' }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {/* Due badge on Revise tab */}
              {id === 'revise' && dueCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: 'white',
                    borderRadius: '999px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.5)',
                  }}
                >
                  {dueCount > 99 ? '99+' : dueCount}
                </motion.span>
              )}
            </div>
            <span>{label}</span>
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="nav-active-indicator"
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
