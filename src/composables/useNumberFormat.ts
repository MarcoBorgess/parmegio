const COMPACT_SUFFIXES: [number, string][] = [
  [1e27, 'OC'],
  [1e24, 'SS'],
  [1e21, 'S'],
  [1e18, 'QQ'],
  [1e15, 'Q'],
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
]

const PARSE_SUFFIXES: [string, number][] = [
  ['OC', 1e27],
  ['SS', 1e24],
  ['S', 1e21],
  ['QQ', 1e18],
  ['Q', 1e15],
  ['T', 1e12],
  ['B', 1e9],
  ['M', 1e6],
  ['K', 1e3],
]

export function useNumberFormat() {
  function formatCompact(n: number, decimals: 1 | 2 = 1): string {
    if (!n) return '0'
    const abs = Math.abs(n)
    for (const [threshold, suffix] of COMPACT_SUFFIXES) {
      if (abs >= threshold) {
        const trimRegex = decimals === 1 ? /\.0$/ : /\.00$/
        return (n / threshold).toFixed(decimals).replace(trimRegex, '') + suffix
      }
    }
    return String(n)
  }

  function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '—'

    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const totalDays = Math.floor(totalHours / 24)
    const months = Math.floor(totalDays / 30)
    const days = totalDays % 30
    const hours = totalHours % 24
    const minutes = totalMinutes % 60

    const parts: string[] = []
    if (months > 0) parts.push(`${months}m`)
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}min`)

    return parts.length > 0 ? parts.join(' ') : '< 1min'
  }

  function breakEvenSeconds(buyValue: number, valuePerSec: number): number {
    if (!valuePerSec) return Infinity
    return buyValue / 2 / valuePerSec
  }

  function formatBreakEven(buyValue: number, valuePerSec: number): string {
    const seconds = breakEvenSeconds(buyValue, valuePerSec)
    return seconds === Infinity ? '—' : formatDuration(seconds)
  }

  function parseNotation(str: string): number {
    if (str === '') return 0
    const s = str.trim().toUpperCase().replace(',', '.')
    for (const [suffix, mult] of PARSE_SUFFIXES) {
      if (s.endsWith(suffix)) {
        const n = parseFloat(s.slice(0, -suffix.length))
        return isNaN(n) ? 0 : n * mult
      }
    }
    const n = parseFloat(s)
    return isNaN(n) ? 0 : n
  }

  return { formatCompact, formatDuration, breakEvenSeconds, formatBreakEven, parseNotation }
}
