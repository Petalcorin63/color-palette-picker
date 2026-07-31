<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
    <div class="max-w-4xl mx-auto px-6 py-16">
      <header class="text-center mb-12">
        <p class="font-mono text-indigo-600 dark:text-indigo-400 text-sm tracking-[0.3em] uppercase mb-3">
          Palette
        </p>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Color Palette Picker</h1>
        <p class="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Build a palette and read the exact RGB values behind every swatch.
        </p>
      </header>

      <!-- Controls -->
      <div class="flex flex-wrap items-center justify-center gap-3 mb-12">
        <label
          class="relative w-11 h-11 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer shrink-0"
          :style="{ backgroundColor: pickerHex }"
        >
          <input
            v-model="pickerHex"
            type="color"
            class="absolute -inset-2 cursor-pointer opacity-0"
            aria-label="Pick a color"
            @change="hexInput = pickerHex"
          >
        </label>

        <input
          v-model="hexInput"
          type="text"
          placeholder="#6366f1"
          maxlength="7"
          class="w-32 px-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-900 border text-sm font-mono text-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          :class="hexInput && !isValidHex(hexInput) ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'"
          @keyup.enter="addFromInput"
        >

        <button
          type="button"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm font-semibold transition-all"
          :disabled="!hexInput || !isValidHex(hexInput)"
          @click="addFromInput"
        >
          Add
        </button>

        <button
          type="button"
          class="px-5 py-2.5 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:border-indigo-500 rounded-full text-sm font-semibold transition-all"
          @click="addRandom"
        >
          Random
        </button>

        <button
          v-if="palette.length"
          type="button"
          class="px-5 py-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full text-sm font-semibold transition-colors"
          @click="palette = []"
        >
          Clear all
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="!palette.length"
        class="text-center py-16 text-gray-400 dark:text-gray-600"
      >
        <p class="text-sm">No colors yet — pick one above or hit "Random" to get started.</p>
      </div>

      <!-- Palette grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PaletteCard
          v-for="entry in palette"
          :key="entry.id"
          :hex="entry.hex"
          @remove="removeColor(entry.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PaletteCard from './components/PaletteCard.vue'
import { isValidHex, normalizeHex, randomHex } from './lib/color'

interface PaletteEntry {
  id: number
  hex: string
}

let nextId = 0
const palette = ref<PaletteEntry[]>([])

const pickerHex = ref('#6366f1')
const hexInput = ref('')

function addColor(hex: string) {
  palette.value.push({ id: nextId++, hex: normalizeHex(hex) })
}

function addFromInput() {
  if (!hexInput.value || !isValidHex(hexInput.value)) return
  addColor(hexInput.value)
  hexInput.value = ''
}

function addRandom() {
  addColor(randomHex())
}

function removeColor(id: number) {
  palette.value = palette.value.filter(entry => entry.id !== id)
}
</script>
