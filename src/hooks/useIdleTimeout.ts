import { useEffect, useRef } from "react"

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
] as const

export function useIdleTimeout(timeoutMs: number, onIdle: () => void) {
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  })

  useEffect(() => {
    let timeoutId: number

    const resetTimer = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => onIdleRef.current(), timeoutMs)
    }

    resetTimer()

    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer, { passive: true })
    )

    return () => {
      window.clearTimeout(timeoutId)
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer)
      )
    }
  }, [timeoutMs])
}
