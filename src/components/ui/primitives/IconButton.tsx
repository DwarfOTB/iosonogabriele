'use client'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import s from './IconButton.module.css'

type Variant = 'light' | 'dark' | 'ghost'
type Shape   = 'circle' | 'square'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  shape?:   Shape
  size?:    Size
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton(
    { variant = 'light', shape = 'circle', size = 'md', className = '', children, ...rest },
    ref
  ) {
    const cls = [s.btn, s[variant], s[shape], s[size], className].join(' ')
    return (
      <button ref={ref} className={cls} {...rest}>
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
