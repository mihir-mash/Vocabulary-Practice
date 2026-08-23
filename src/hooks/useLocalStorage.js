import { useState, useEffect } from 'react'

/**
 * A hook that syncs state with localStorage.
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (err) {
      console.warn(`useLocalStorage read error for key "${key}":`, err)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (err) {
      console.warn(`useLocalStorage write error for key "${key}":`, err)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
