'use client'
import { useEffect, useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'

const SWIPE_THRESHOLD = 50

export function useRoomNavigation() {
  const nextRoom   = useWorldStore((s) => s.nextRoom)
  const prevRoom   = useWorldStore((s) => s.prevRoom)
  const closePanel = useWorldStore((s) => s.closePanel)
  const touchStartX = useRef<number>(0)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return
      switch (e.key) {
        case 'ArrowRight': nextRoom();   break
        case 'ArrowLeft':  prevRoom();   break
        case 'Escape':     closePanel(); break
      }
    }

    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX
    }

    function onTouchEnd(e: TouchEvent) {
      const delta = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(delta) < SWIPE_THRESHOLD) return
      if (delta < 0) nextRoom()
      else           prevRoom()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [nextRoom, prevRoom, closePanel])
}
