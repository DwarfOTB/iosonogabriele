'use client'
import s from './KeyboardHint.module.css'

export default function KeyboardHint() {
  return (
    <p className={s.hint} aria-hidden="true">
      ← → naviga · click interagisci · esc chiudi
    </p>
  )
}
