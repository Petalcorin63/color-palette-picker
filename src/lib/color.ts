export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

const HEX_RE = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim())
}

export function normalizeHex(value: string): string {
  const trimmed = value.trim().replace(/^#/, '')
  const expanded = trimmed.length === 3
    ? trimmed.split('').map(c => c + c).join('')
    : trimmed
  return `#${expanded.toLowerCase()}`
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex).slice(1)
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const delta = max - min
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  let h: number
  switch (max) {
    case rn:
      h = ((gn - bn) / delta) % 6
      break
    case gn:
      h = (bn - rn) / delta + 2
      break
    default:
      h = (rn - gn) / delta + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function randomHex(): string {
  const value = Math.floor(Math.random() * 0xffffff)
  return `#${value.toString(16).padStart(6, '0')}`
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** Ink color ("#000" or "#fff") that stays readable on top of the given fill. */
export function readableInkOn(hex: string): '#000000' | '#ffffff' {
  return relativeLuminance(hexToRgb(hex)) > 0.5 ? '#000000' : '#ffffff'
}
