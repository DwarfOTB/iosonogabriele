'use client'
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import s from './Input.module.css'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(
  function Input({ label, error, wrapperClassName = '', className = '', id, ...rest }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errId   = inputId ? `${inputId}-error` : undefined

    return (
      <div className={`${s.wrapper} ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className={s.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[s.input, error ? s.error : '', className].join(' ')}
          aria-describedby={error ? errId : undefined}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {error && (
          <span id={errId} className={s.errorMsg} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
