'use client'
import { create } from 'zustand'

export interface WorldState {
  currentRoom: number
  activePanel: string | null
  hoveredObject: string | null
  isTransitioning: boolean
  setRoom: (i: number) => void
  nextRoom: () => void
  prevRoom: () => void
  openPanel: (id: string) => void
  closePanel: () => void
  setHovered: (id: string | null) => void
  setTransitioning: (v: boolean) => void
}

export const TOTAL_ROOMS = 5

export const useWorldStore = create<WorldState>((set, get) => ({
  currentRoom:   0,
  activePanel:   null,
  hoveredObject: null,
  isTransitioning: false,
  setRoom:      (i) => set({ currentRoom: Math.max(0, Math.min(TOTAL_ROOMS - 1, i)), activePanel: null }),
  nextRoom:     () => get().setRoom(get().currentRoom + 1),
  prevRoom:     () => get().setRoom(get().currentRoom - 1),
  openPanel:    (id) => set({ activePanel: id }),
  closePanel:   () => set({ activePanel: null }),
  setHovered:   (id) => set({ hoveredObject: id }),
  setTransitioning: (v) => set({ isTransitioning: v }),
}))
