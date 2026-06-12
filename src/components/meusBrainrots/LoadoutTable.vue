<script setup lang="ts">
import { useNumberFormat } from '@/composables/useNumberFormat'
import SpinnerInput from '@/components/common/SpinnerInput.vue'
import MobDropdown from './MobDropdown.vue'
import type { Brainrot } from '@/types/brainrot'
import type { RarityConfig } from '@/types/rarity'

export interface LoadoutRow {
  name: string
  icon: string
  mob: string
  color: string
  qty: number
  cost: number
  afkPs: number
  evtPs: number
}

const props = defineProps<{
  rows: LoadoutRow[]
  brainrots: Brainrot[]
  rarities: RarityConfig[]
}>()

const emit = defineEmits<{
  'update-qty': [name: string, qty: number]
  remove: [name: string]
  add: [name: string]
}>()

const { formatCompact } = useNumberFormat()

const timeCols = [
  { label: '/s', multiplier: 1 },
  { label: '/m', multiplier: 60 },
  { label: '/h', multiplier: 3600 },
  { label: '/d', multiplier: 86400 },
]
</script>

<template>
  <div class="overflow-hidden rounded-t-xl border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr>
            <th class="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-faint">Brainrot</th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">Qtd</th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">Custo</th>
            <template v-for="col in timeCols" :key="col.label">
              <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">AFK {{ col.label }}</th>
              <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">Evento {{ col.label }}</th>
            </template>
            <th class="border-b border-border px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="props.rows.length === 0">
            <td colspan="12" class="border-b border-border-table px-4 py-5 text-center text-faint">Nenhum brainrot adicionado.</td>
          </tr>
          <tr v-for="row in props.rows" :key="row.name" class="last:[&>td]:border-b-0 hover:bg-surface-hover">
            <td class="border-b border-border-table px-4 py-2.5 text-left">
              <div class="flex items-center gap-2">
                <img :src="`/icons/mobs/${row.icon}`" :alt="row.mob" class="h-6 w-6 object-contain [image-rendering:pixelated]" />
                <span class="font-bold" :style="{ color: row.color }">{{ row.name }}</span>
              </div>
            </td>
            <td class="border-b border-border-table px-4 py-2.5 text-right">
              <SpinnerInput
                class="ml-auto w-24"
                :model-value="row.qty"
                :min="0"
                :step="1"
                @update:model-value="(qty) => emit('update-qty', row.name, qty)"
              />
            </td>
            <td class="border-b border-border-table px-4 py-2.5 text-right text-accent-green">{{ formatCompact(row.cost, 2) }}</td>
            <template v-for="col in timeCols" :key="col.label">
              <td class="border-b border-border-table px-4 py-2.5 text-right text-accent-green">{{ formatCompact(row.afkPs * col.multiplier, 2) }}</td>
              <td class="border-b border-border-table px-4 py-2.5 text-right text-accent-green-dark">{{ formatCompact(row.evtPs * col.multiplier, 2) }}</td>
            </template>
            <td class="border-b border-border-table px-4 py-2.5 text-right">
              <button
                class="cursor-pointer rounded-md border border-border px-2 py-1 text-sm text-faint transition-colors hover:border-accent-danger hover:text-accent-danger"
                @click="emit('remove', row.name)"
              >
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="rounded-b-xl border border-t-0 border-border bg-surface px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
    <MobDropdown
      :brainrots="brainrots"
      :rarities="rarities"
      :model-value="null"
      placeholder="Adicionar brainrot..."
      @update:model-value="emit('add', $event)"
    />
  </div>
</template>
