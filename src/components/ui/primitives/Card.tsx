'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import s from './Card.module.css'

type Variant = 'default' | 'elevated' | 'flat' | 'dark'

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  children: ReactNode
}

export function Card({ variant = 'default', className = '', children, ...rest }: Props) {
  const cls = [s.card, variant !== 'default' ? s[variant] : '', className].join(' ')
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}
