<template>
  <div class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
    <div class="h-20" :style="{ backgroundColor: hex }" />

    <div class="p-4 space-y-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ hex }}</p>
          <p class="font-mono text-xs text-gray-400 mt-0.5">
            {{ oklch }}
          </p>
        </div>
        <button
          type="button"
          class="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors"
          :aria-label="`Copy ${hex}`"
          @click="copy(hex)"
        >
          <span class="text-xs">{{ copied ? '✓' : '⧉' }}</span>
        </button>
      </div>

      <RgbChart :r="rgb.r" :g="rgb.g" :b="rgb.b" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useClipboardCopy } from '../composables/useClipboardCopy'
import { formatOklch, hexToRgb, rgbToOklch } from '../lib/color'
import RgbChart from './RgbChart.vue'

const props = defineProps<{ hex: string }>()

const rgb = computed(() => hexToRgb(props.hex))
const oklch = computed(() => formatOklch(rgbToOklch(rgb.value)))

const { copied, copy } = useClipboardCopy()
</script>
