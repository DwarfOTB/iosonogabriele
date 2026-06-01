'use client'
import { create } from 'zustand'
import { TOTAL_ROOMS } from '@/data/rooms'

export type TransitionPhase = 'idle' | 'dismantling' | 'assembling'

export interface WorldState {
  currentRoom:     number
  previousRoom:    number
  transitionPhase: TransitionPhase
  activePanel:     string | null
  hoveredObject:   string | null

  setRoom:             (i: number) => void
  nextRoom:            () => void
  prevRoom:            () => void
  setTransitionPhase:  (p: TransitionPhase) => void
  openPanel:           (id: string) => void
  closePanel:          () => void
  setHovered:          (id: string | null) => void
}

export const useWorldStore = create<WorldState>((set, get) => ({
  currentRoom:     0,
  previousRoom:    0,
  transitionPhase: 'idle',
  activePanel:     null,
  hoveredObject:   null,

  setRoom: (i) => {
    const clamped = Math.max(0, Math.min(TOTAL_ROOMS - 1, i))
    const current = get().currentRoom
    if (clamped === current || get().transitionPhase !== 'idle') return

    set({ previousRoom: current, transitionPhase: 'dismantling', activePanel: null })

    setTimeout(() => {
      set({ currentRoom: clamped, transitionPhase: 'assembling' })
      setTimeout(() => {
        set({ transitionPhase: 'idle' })
      }, 900)
    }, 900)
  },

  nextRoom: () => get().setRoom(get().currentRoom + 1),
  prevRoom: () => get().setRoom(get().currentRoom - 1),

  setTransitionPhase: (p) => set({ transitionPhase: p }),

  openPanel:  (id) => set({ activePanel: id }),
  closePanel: ()   => set({ activePanel: null }),
  setHovered: (id) => set({ hoveredObject: id }),
}))

// Back-compat: isTransitioning derived from transitionPhase
export function useIsTransitioning() {
  return useWorldStore((s) => s.transitionPhase !== 'idle')
}
