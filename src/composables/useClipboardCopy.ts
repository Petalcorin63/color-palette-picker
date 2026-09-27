import { ref } from 'vue'

/** Copies text to the clipboard and exposes a transient `copied` flag for UI feedback. */
export function useClipboardCopy(resetDelayMs = 1200) {
  const copied = ref(false)
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => { copied.value = false }, resetDelayMs)
  }

  return { copied, copy }
}
