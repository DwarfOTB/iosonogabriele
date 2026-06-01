'use client'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import s from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'spotify'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  // Render as anchor when href provided
  href?: undefined
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  href: string
  as?: 'a'
}

type Props = ButtonProps | LinkButtonProps

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  function Button(props, ref) {
    const { variant = 'primary', size = 'md', className = '', children, ...rest } = props
    const cls = [s.btn, s[variant], s[size], className].join(' ')

    if ('href' in props && props.href !== undefined) {
      return (
        <a
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={props.href}
          className={cls}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {children}
        </a>
      )
    }

    return (
      <button
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        className={cls}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
