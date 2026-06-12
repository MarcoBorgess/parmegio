<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [number]
}>()

function clamp(value: number): number {
  let result = value
  if (props.min !== undefined) result = Math.max(props.min, result)
  if (props.max !== undefined) result = Math.min(props.max, result)
  return result
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const value = parseFloat(raw)
  emit('update:modelValue', isNaN(value) ? 0 : value)
}

function onStep(dir: 1 | -1) {
  emit('update:modelValue', clamp(round(props.modelValue + dir * (props.step ?? 1))))
}
</script>

<template>
  <div class="flex">
    <div class="flex flex-col">
      <button
        type="button"
        tabindex="-1"
        class="flex h-1/2 w-6 cursor-pointer items-center justify-center rounded-tl-md border border-r-0 border-border bg-surface-input text-[10px] text-faint hover:border-border-hover hover:text-body"
        @click="onStep(1)"
      >
        ▲
      </button>
      <button
        type="button"
        tabindex="-1"
        class="-mt-px flex h-1/2 w-6 cursor-pointer items-center justify-center rounded-bl-md border border-r-0 border-t-border border-border bg-surface-input text-[10px] text-faint hover:border-border-hover hover:text-body"
        @click="onStep(-1)"
      >
        ▼
      </button>
    </div>
    <input
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step ?? 1"
      class="[appearance:textfield] min-w-0 flex-1 rounded-r-md border border-border bg-surface-input px-2 py-1 text-right text-sm text-body focus:border-border-hover focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      @input="onInput"
      @click="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>
