import { darkModeVariant, hexToOklchString, type HarmonySet } from './color'

export interface PaletteEntry {
  name: string
  hex: string
}

/** Flattens the primary color and every harmony scheme into named, exportable entries. */
export function buildPaletteEntries(primaryHex: string, harmony: HarmonySet): PaletteEntry[] {
  const entries: PaletteEntry[] = [{ name: 'primary', hex: primaryHex }]

  const pushGroup = (name: string, colors: string[]) => {
    if (colors.length === 1) {
      entries.push({ name, hex: colors[0] })
      return
    }
    colors.forEach((hex, i) => entries.push({ name: `${name}-${i + 1}`, hex }))
  }

  pushGroup('complementary', harmony.complementary)
  pushGroup('analogous', harmony.analogous)
  pushGroup('triadic', harmony.triadic)
  pushGroup('split-complementary', harmony.splitComplementary)
  pushGroup('monochromatic', harmony.monochromatic)

  return entries
}

/** Maps each entry to its dark-mode counterpart, keeping names aligned for the override block. */
export function buildDarkEntries(entries: PaletteEntry[]): PaletteEntry[] {
  return entries.map(e => ({ name: e.name, hex: darkModeVariant(e.hex) }))
}

/**
 * Plain CSS custom properties, e.g. `--color-primary: oklch(58.5% 0.233 264.05);`
 * under `:root`. When `darkEntries` is passed, the same names are overridden
 * inside `@media (prefers-color-scheme: dark)` — the same mechanism this
 * app's own `dark:` Tailwind classes rely on.
 */
export function toCssVariables(entries: PaletteEntry[], darkEntries?: PaletteEntry[]): string {
  const lines = entries.map(e => `  --color-${e.name}: ${hexToOklchString(e.hex)};`).join('\n')
  let css = `:root {\n${lines}\n}\n`

  if (darkEntries) {
    const darkLines = darkEntries.map(e => `    --color-${e.name}: ${hexToOklchString(e.hex)};`).join('\n')
    css += `\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkLines}\n  }\n}\n`
  }

  return css
}

/**
 * Tailwind CSS v4 `@theme` block — the same `--color-*` variables also
 * register as utilities (bg-primary, text-accent, ...). Dark-mode overrides
 * live outside `@theme` (theme vars are still plain custom properties, so a
 * media query on `:root` overrides them at runtime). Values are written as
 * `oklch()`, matching Tailwind v4's own default palette format.
 */
export function toTailwindTheme(entries: PaletteEntry[], darkEntries?: PaletteEntry[]): string {
  const lines = entries.map(e => `  --color-${e.name}: ${hexToOklchString(e.hex)};`).join('\n')
  let css = `@theme {\n${lines}\n}\n`

  if (darkEntries) {
    const darkLines = darkEntries.map(e => `    --color-${e.name}: ${hexToOklchString(e.hex)};`).join('\n')
    css += `\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkLines}\n  }\n}\n`
  }

  return css
}

export function downloadTextFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
