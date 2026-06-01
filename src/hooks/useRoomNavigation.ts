'use client'
import { useEffect, useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'

const SWIPE_THRESHOLD = 50

export function useRoomNavigation() {
  const nextRoom   = useWorldStore((s) => s.nextRoom)
  const prevRoom   = useWorldStore((s) => s.prevRoom)
  const closePanel = useWorldStore((s) => s.closePanel)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)

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
      touchStartY.current = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      // Don't hijack gestures while a content panel / sheet is open.
      if (useWorldStore.getState().activePanel) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      // Horizontal intent only (ignore vertical scrolls / taps).
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) nextRoom()
      else        prevRoom()
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
