export interface NeededBrainrot {
  name: string
  qty: number
}

export interface Rebirth {
  level: number
  coinsMultiplier: number
  tokensMultiplier: number
  cost: number
  neededBrainrots: NeededBrainrot[]
}

export interface RebirthWithTotals extends Rebirth {
  brainrotsCost: number
  total: number
  cumulativeTotal: number
}
