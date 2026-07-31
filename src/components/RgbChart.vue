<template>
  <div class="space-y-1.5" role="img" :aria-label="`RGB values: red ${r}, green ${g}, blue ${b}, out of 255`">
    <div
      v-for="channel in channels"
      :key="channel.label"
      class="flex items-center gap-2"
    >
      <span class="w-3 shrink-0 text-[11px] font-mono font-semibold text-gray-400 dark:text-gray-500">
        {{ channel.label }}
      </span>
      <div class="relative h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          class="absolute inset-y-0 left-0 rounded-r-full"
          :style="{ width: `${(channel.value / 255) * 100}%`, backgroundColor: channel.color }"
        />
      </div>
      <span class="w-7 shrink-0 text-right text-[11px] font-mono tabular-nums text-gray-500 dark:text-gray-400">
        {{ channel.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ r: number, g: number, b: number }>()

// Fixed order, fixed colors: the literal RGB-channel convention, not an
// arbitrary categorical assignment — every value also carries a text label
// (R/G/B + number) so identity never depends on distinguishing the hues.
const channels = computed(() => [
  { label: 'R', value: props.r, color: '#ef4444' },
  { label: 'G', value: props.g, color: '#10b981' },
  { label: 'B', value: props.b, color: '#3b82f6' },
])
</script>
