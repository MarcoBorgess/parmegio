<script setup lang="ts">
import { useNumberFormat } from '@/composables/useNumberFormat'

const props = defineProps<{
  title: string
  hint: string
  tooltip: string
  valuePerSec: number
  valueClass: string
}>()

const { formatCompact } = useNumberFormat()

const rows = [
  { label: '/ s', multiplier: 1 },
  { label: '/ m', multiplier: 60 },
  { label: '/ h', multiplier: 3600 },
  { label: '/ d', multiplier: 86400 },
]
</script>

<template>
  <div class="flex min-w-[180px] flex-1 flex-col justify-center gap-2 rounded-xl border border-border bg-surface p-4 px-5">
    <div class="flex items-center justify-between text-[0.85rem] font-semibold uppercase tracking-wide text-muted">
      <span>{{ title }} <span class="text-xs font-normal normal-case tracking-normal text-accent-orange">· {{ hint }}</span></span>
      <span class="group relative ml-1 inline-flex h-[13px] w-[13px] shrink-0 cursor-help items-center justify-center rounded-full bg-border text-[0.6rem] font-bold not-italic text-faint">
        i
        <span
          class="pointer-events-none absolute right-0 top-full z-50 hidden mt-1.5 w-max max-w-60 whitespace-pre-line rounded-md border border-border bg-surface-input px-2.5 py-1.5 text-xs font-normal normal-case tracking-normal text-muted group-hover:block"
        >
          {{ tooltip }}
        </span>
      </span>
    </div>
    <div class="flex flex-col">
      <div v-for="row in rows" :key="row.label" class="flex items-center justify-between border-b border-border-table py-1 text-sm last:border-b-0">
        <span class="text-faint">{{ row.label }}</span>
        <strong class="text-[0.95rem] font-bold" :class="valueClass">{{ formatCompact(props.valuePerSec * row.multiplier, 2) }}</strong>
      </div>
    </div>
  </div>
</template>
