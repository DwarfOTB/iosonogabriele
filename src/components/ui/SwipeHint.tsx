'use client'
import { useEffect, useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import s from './SwipeHint.module.css'

// One-time mobile coach mark: how to navigate. Hidden on desktop (CSS),
// dismissed on first room change or after a few seconds (once per session).
export default function SwipeHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('swipeHintSeen')) return
    setShow(true)
    const dismiss = () => { setShow(false); sessionStorage.setItem('swipeHintSeen', '1') }
    const t = setTimeout(dismiss, 5000)
    const unsub = useWorldStore.subscribe((st, prev) => {
      if (st.currentRoom !== prev.currentRoom) dismiss()
    })
    return () => { clearTimeout(t); unsub() }
  }, [])

  if (!show) return null

  return (
    <div className={s.hint} aria-hidden="true">
      <span className={s.arrow}>←</span>
      <span className={s.text}>scorri per cambiare stanza · tocca <b>+</b> per interagire</span>
      <span className={s.arrow}>→</span>
    </div>
  )
}
