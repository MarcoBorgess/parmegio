<script setup lang="ts" generic="T extends object">
import type { ColumnDef } from './types'

defineProps<{
  columns: ColumnDef[]
  rows: T[]
  sortState: { col: string; asc: boolean }
}>()

defineEmits<{
  sort: [col: string]
}>()

function cellValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
    <div class="overflow-x-auto">
      <table class="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'cursor-pointer border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-faint select-none hover:text-muted',
                col.numeric ? 'text-right' : 'text-left',
              ]"
              @click="$emit('sort', col.key)"
            >
              {{ col.label }}
              <span v-if="sortState.col === col.key" class="ml-1 text-accent-blue">
                {{ sortState.asc ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in rows"
            :key="index"
            class="last:[&>td]:border-b-0 hover:bg-surface-hover"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['border-b border-border-table px-4 py-2.5', col.numeric ? 'text-right' : 'text-left']"
            >
              <slot :name="`cell-${col.key}`" :row="row">
                {{ cellValue(row, col.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
