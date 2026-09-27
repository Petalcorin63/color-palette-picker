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

export interface Oklch {
  l: number
  c: number
  h: number
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

/** sRGB -> OKLCH, via Björn Ottosson's OKLab formulas (linearize -> LMS -> OKLab -> polar). */
export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  const c = Math.sqrt(a * a + b2 * b2)
  let h = Math.atan2(b2, a) * (180 / Math.PI)
  if (h < 0) h += 360

  return { l: L * 100, c, h }
}

/**
 * CSS `oklch()` function notation, e.g. `oklch(58.5% 0.233 264.05)`. Hue is
 * numerically unstable at zero chroma (grays/black/white) — floating-point
 * error in the OKLab matrix produces an arbitrary-looking non-zero hue for
 * what is actually a "powerless" component, so it's rendered as the CSS
 * Color 4 `none` keyword instead of a misleading number.
 */
export function formatOklch({ l, c, h }: Oklch): string {
  const hue = c < 0.0005 ? 'none' : h.toFixed(2)
  return `oklch(${l.toFixed(1)}% ${c.toFixed(3)} ${hue})`
}

export function hexToOklchString(hex: string): string {
  return formatOklch(rgbToOklch(hexToRgb(hex)))
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

// Below this saturation, hue is effectively undefined (rotating it changes
// nothing — hslToRgb collapses to the same gray regardless of h), so every
// hue-based scheme would just repeat the primary color. Same 5-point
// tolerance already used for the monochromatic-vs-primary lightness gap.
const ACHROMATIC_SATURATION_THRESHOLD = 5

/**
 * Standard color-theory accent recommendations derived from a single primary
 * color. For a (near-)achromatic primary, the hue-rotation schemes
 * (complementary/analogous/triadic/split-complementary) are meaningless —
 * they'd all just repeat the primary's own gray — so they're omitted
 * entirely rather than shown as redundant duplicate swatches; only
 * `monochromatic` (varying lightness) still applies to a gray.
 */
export function generateHarmony(primaryHex: string): HarmonySet {
  const primaryHsl = rgbToHsl(hexToRgb(primaryHex))
  const isAchromatic = primaryHsl.s <= ACHROMATIC_SATURATION_THRESHOLD

  return {
    complementary: isAchromatic ? [] : [rotateHue(primaryHex, 180)],
    analogous: isAchromatic ? [] : [rotateHue(primaryHex, -30), rotateHue(primaryHex, 30)],
    triadic: isAchromatic ? [] : [rotateHue(primaryHex, 120), rotateHue(primaryHex, 240)],
    splitComplementary: isAchromatic ? [] : [rotateHue(primaryHex, 150), rotateHue(primaryHex, 210)],
    // Distinct lightness steps can still round to the same hex (e.g. a
    // desaturated primary); drop repeats so no two monochromatic swatches
    // ever show/export the same color.
    monochromatic: [...new Set(
      MONOCHROMATIC_LIGHTNESS_STEPS
        .filter(l => Math.abs(l - primaryHsl.l) > 5)
        .map(l => hslToHex({ ...primaryHsl, l })),
    )],
  }
}

const DARK_MODE_LIGHTEN_FACTOR = 0.35

/**
 * Dark-mode counterpart of a color: pushes lightness toward white, scaled by
 * how dark the color already is (a near-black tone gains the most contrast
 * against a dark background; an already-light tone barely changes). Hue and
 * saturation are kept, and the transform is monotonic in L so relative
 * ordering within a ramp (e.g. monochromatic steps) is preserved.
 */
export function darkModeVariant(hex: string): string {
  const hsl = rgbToHsl(hexToRgb(hex))
  const l = hsl.l + (100 - hsl.l) * DARK_MODE_LIGHTEN_FACTOR
  return hslToHex({ ...hsl, l: Math.round(l) })
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
