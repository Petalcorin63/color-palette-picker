<template>
  <div class="relative inline-block">
    <button
      type="button"
      class="px-5 py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 rounded-full text-sm font-semibold transition-all"
      @click="open = !open"
    >
      Export palette
    </button>

    <template v-if="open">
      <div class="fixed inset-0 z-10" @click="open = false" />

      <div class="absolute z-20 mt-2 w-80 right-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-4 space-y-3">
        <div class="flex items-center justify-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
          <button
            v-for="option in formatOptions"
            :key="option.key"
            type="button"
            class="flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            :class="format === option.key
              ? 'bg-white dark:bg-gray-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
            @click="format = option.key"
          >
            {{ option.label }}
          </button>
        </div>

        <pre class="max-h-48 overflow-auto rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-3 text-[11px] font-mono leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre">{{ preview }}</pre>

        <label class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
          <input
            v-model="includeDarkMode"
            type="checkbox"
            class="w-3.5 h-3.5 rounded accent-indigo-600"
          >
          Include dark mode values
        </label>

        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            @click="copy(preview)"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-full text-xs font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors"
            @click="download"
          >
            Download
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClipboardCopy } from '../composables/useClipboardCopy'
import type { HarmonySet } from '../lib/color'
import { buildDarkEntries, buildPaletteEntries, downloadTextFile, toCssVariables, toTailwindTheme } from '../lib/paletteExport'

const props = defineProps<{ primaryHex: string, harmony: HarmonySet }>()

const open = ref(false)
const includeDarkMode = ref(false)
const { copied, copy } = useClipboardCopy()

type Format = 'css' | 'tailwind'

const formatOptions: { key: Format, label: string, filename: string }[] = [
  { key: 'css', label: 'CSS variables', filename: 'palette.css' },
  { key: 'tailwind', label: 'Tailwind theme', filename: 'tailwind.css' },
]

const format = ref<Format>('css')

const entries = computed(() => buildPaletteEntries(props.primaryHex, props.harmony))
const darkEntries = computed(() => includeDarkMode.value ? buildDarkEntries(entries.value) : undefined)

const preview = computed(() => format.value === 'css'
  ? toCssVariables(entries.value, darkEntries.value)
  : toTailwindTheme(entries.value, darkEntries.value))

function download() {
  const option = formatOptions.find(o => o.key === format.value)!
  downloadTextFile(option.filename, preview.value)
}
</script>
