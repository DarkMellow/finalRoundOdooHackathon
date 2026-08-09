import { useState, useEffect, useRef, useCallback, useMemo } from "react"

/**
 * Custom debounced value hook adhering strictly to useMemo + useCallback rules.
 *
 * How it works:
 * 1. The input UI updates instantly via controlled state (e.g. `searchQuery`).
 * 2. `useDebounce` delays updating `debouncedValue` until the user stops typing for `delayMs` (default: 400ms).
 * 3. `cancelTimer` (useCallback) and `scheduleUpdate` (useCallback) provide a stable, memoized update handler (`debouncedHandler` via useMemo) that isn't recreated on every render.
 * 4. If the user types a new character before 400ms elapses, `clearTimeout` cancels the pending timer and restarts the 400ms countdown.
 * 5. On unmount, `clearTimeout` cleans up any pending timer to prevent state updates on unmounted components.
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1. Stable cancel function with useCallback
  const cancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 2. Stable debounced scheduler with useCallback
  const scheduleUpdate = useCallback(
    (newValue: T) => {
      cancelTimer()
      timerRef.current = setTimeout(() => {
        setDebouncedValue(newValue)
      }, delayMs)
    },
    [cancelTimer, delayMs]
  )

  // 3. Memoized debounced handler with useMemo so it isn't recreated on every render
  const debouncedHandler = useMemo(() => scheduleUpdate, [scheduleUpdate])

  // 4. Trigger debounced handler when raw value changes + cleanup timer on unmount
  useEffect(() => {
    debouncedHandler(value)
    return () => {
      cancelTimer()
    }
  }, [value, debouncedHandler, cancelTimer])

  return debouncedValue
}

export default useDebounce
