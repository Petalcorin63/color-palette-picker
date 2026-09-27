<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
    <div class="max-w-4xl mx-auto px-6 py-16">
      <header class="text-center mb-12">
        <p class="font-mono text-indigo-600 dark:text-indigo-400 text-sm tracking-[0.3em] uppercase mb-3">
          Palette
        </p>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Color Palette Picker</h1>
        <p class="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Pick a primary color and get secondary/accent recommendations from
          color theory, each with its exact RGB values as reference.
        </p>
      </header>

      <!-- Primary color controls -->
      <div class="flex flex-wrap items-center justify-center gap-3 mb-8">
        <label
          class="relative w-11 h-11 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 cursor-pointer shrink-0"
          :style="{ backgroundColor: primaryHex }"
        >
          <input
            v-model="primaryHex"
            type="color"
            class="absolute -inset-2 cursor-pointer opacity-0"
            aria-label="Pick a primary color"
          >
        </label>

        <input
          v-model="hexInput"
          type="text"
          placeholder="#6366f1"
          maxlength="7"
          class="w-32 px-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-900 border text-sm font-mono text-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          :class="hexInput && !isValidHex(hexInput) ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'"
          @keyup.enter="applyHexInput"
          @blur="applyHexInput"
        >

        <button
          type="button"
          class="px-5 py-2.5 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:border-indigo-500 rounded-full text-sm font-semibold transition-all"
          @click="randomizePrimary"
        >
          Random
        </button>

        <ExportPalette :primary-hex="primaryHex" :harmony="harmony" />
      </div>

      <!-- Primary color -->
      <section class="mb-12 max-w-xs mx-auto">
        <p class="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Primary
        </p>
        <ColorCard :hex="primaryHex" />
      </section>

      <!-- Harmony recommendations -->
      <section
        v-for="scheme in harmonySchemes"
        :key="scheme.key"
        class="mb-12"
      >
        <div class="text-center mb-5">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ scheme.title }}</h2>
          <p class="text-sm text-gray-400">{{ scheme.description }}</p>
        </div>
        <div class="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          <ColorCard
            v-for="hex in scheme.colors"
            :key="hex"
            :hex="hex"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorCard from './components/ColorCard.vue'
import ExportPalette from './components/ExportPalette.vue'
import { usePaletteBuilder } from './composables/usePaletteBuilder'
import { isValidHex } from './lib/color'

const { primaryHex, hexInput, harmony, harmonySchemes, applyHexInput, randomizePrimary } = usePaletteBuilder()
</script>
