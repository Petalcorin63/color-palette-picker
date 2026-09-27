import { computed, ref } from 'vue'
import type { HarmonySet } from '../lib/color'
import { generateHarmony, isValidHex, normalizeHex, randomHex } from '../lib/color'

export interface HarmonyScheme {
  key: keyof HarmonySet
  title: string
  description: string
  colors: string[]
}

const SCHEME_META: Omit<HarmonyScheme, 'colors'>[] = [
  { key: 'complementary', title: 'Complementary', description: 'Opposite hue (+180°) — high contrast, use sparingly as an accent.' },
  { key: 'analogous', title: 'Analogous', description: 'Neighboring hues (±30°) — calm, cohesive palettes.' },
  { key: 'triadic', title: 'Triadic', description: 'Evenly spaced hues (±120°) — vibrant, balanced contrast.' },
  { key: 'splitComplementary', title: 'Split-Complementary', description: 'Complement’s neighbors (±150°/±210°) — contrast with less tension.' },
  { key: 'monochromatic', title: 'Monochromatic', description: 'Same hue, varied lightness — safe tints/shades for UI states.' },
]

/** Owns the primary-color input state and derives the harmony recommendations shown on the page. */
export function usePaletteBuilder(initialHex = '#6366f1') {
  const primaryHex = ref(initialHex)
  const hexInput = ref(primaryHex.value)

  function applyHexInput() {
    if (!hexInput.value || !isValidHex(hexInput.value)) {
      hexInput.value = primaryHex.value
      return
    }
    primaryHex.value = normalizeHex(hexInput.value)
    hexInput.value = primaryHex.value
  }

  function randomizePrimary() {
    primaryHex.value = randomHex()
    hexInput.value = primaryHex.value
  }

  const harmony = computed(() => generateHarmony(primaryHex.value))

  const harmonySchemes = computed<HarmonyScheme[]>(() => SCHEME_META
    .map(meta => ({ ...meta, colors: harmony.value[meta.key] }))
    // A (near-)achromatic primary makes every hue-rotation scheme collapse
    // to an empty array (see generateHarmony) — skip those sections instead
    // of rendering an empty grid under a heading.
    .filter(scheme => scheme.colors.length > 0))

  return { primaryHex, hexInput, harmony, harmonySchemes, applyHexInput, randomizePrimary }
}
