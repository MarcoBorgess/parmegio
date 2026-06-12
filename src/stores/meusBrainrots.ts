import { defineStore } from 'pinia'
import type { LoadoutEntry, MbConfig } from '@/types/meusBrainrots'

const LS_REBIRTH = 'parmegio:mb-rebirth'
const LS_CONFIG = 'parmegio:mb-config'
const LS_LOADOUT = 'parmegio:mb-loadout'

const MAX_LEVEL = 25

const DEFAULT_CONFIG: MbConfig = { vip: 'none', booster: 3.5, eventMulti: 3.5 }

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const useMeusBrainrotsStore = defineStore('meusBrainrots', {
  state: () => ({
    rebirthLevel: load<number>(LS_REBIRTH, 0),
    config: load<MbConfig>(LS_CONFIG, { ...DEFAULT_CONFIG }),
    loadout: load<LoadoutEntry[]>(LS_LOADOUT, []),
    hasConfig: localStorage.getItem(LS_CONFIG) !== null,
  }),
  actions: {
    setLevel(level: number) {
      this.rebirthLevel = Math.max(0, Math.min(MAX_LEVEL, level))
      localStorage.setItem(LS_REBIRTH, JSON.stringify(this.rebirthLevel))
    },
    saveConfig(config: MbConfig) {
      this.config = config
      this.hasConfig = true
      localStorage.setItem(LS_CONFIG, JSON.stringify(config))
    },
    addToLoadout(name: string) {
      const existing = this.loadout.find((e) => e.name === name)
      if (existing) existing.qty += 1
      else this.loadout.push({ name, qty: 1 })
      this.persistLoadout()
    },
    setQty(name: string, qty: number) {
      if (qty <= 0) {
        this.loadout = this.loadout.filter((e) => e.name !== name)
      } else {
        const existing = this.loadout.find((e) => e.name === name)
        if (existing) existing.qty = qty
      }
      this.persistLoadout()
    },
    removeFromLoadout(name: string) {
      this.loadout = this.loadout.filter((e) => e.name !== name)
      this.persistLoadout()
    },
    persistLoadout() {
      localStorage.setItem(LS_LOADOUT, JSON.stringify(this.loadout))
    },
  },
})
