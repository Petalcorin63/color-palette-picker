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

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hn = ((h % 360) + 360) % 360
  const sn = Math.min(100, Math.max(0, s)) / 100
  const ln = Math.min(100, Math.max(0, l)) / 100

  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
  const m = ln - c / 2

  let [r, g, b] = [0, 0, 0]
  if (hn < 60) [r, g, b] = [c, x, 0]
  else if (hn < 120) [r, g, b] = [x, c, 0]
  else if (hn < 180) [r, g, b] = [0, c, x]
  else if (hn < 240) [r, g, b] = [0, x, c]
  else if (hn < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl))
}

/** Rotate a hex color's hue by the given degrees, keeping its saturation/lightness. */
function rotateHue(hex: string, degrees: number): string {
  const hsl = rgbToHsl(hexToRgb(hex))
  return hslToHex({ ...hsl, h: hsl.h + degrees })
}

export interface HarmonySet {
  complementary: string[]
  analogous: string[]
  triadic: string[]
  splitComplementary: string[]
  monochromatic: string[]
}

const MONOCHROMATIC_LIGHTNESS_STEPS = [25, 40, 65, 80]

/** Standard color-theory accent recommendations derived from a single primary color. */
export function generateHarmony(primaryHex: string): HarmonySet {
  const primaryHsl = rgbToHsl(hexToRgb(primaryHex))

  return {
    complementary: [rotateHue(primaryHex, 180)],
    analogous: [rotateHue(primaryHex, -30), rotateHue(primaryHex, 30)],
    triadic: [rotateHue(primaryHex, 120), rotateHue(primaryHex, 240)],
    splitComplementary: [rotateHue(primaryHex, 150), rotateHue(primaryHex, 210)],
    monochromatic: MONOCHROMATIC_LIGHTNESS_STEPS
      .filter(l => Math.abs(l - primaryHsl.l) > 5)
      .map(l => hslToHex({ ...primaryHsl, l })),
  }
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
