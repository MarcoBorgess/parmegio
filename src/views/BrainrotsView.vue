<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJsonData } from '@/composables/useJsonData'
import { useNumberFormat } from '@/composables/useNumberFormat'
import { useSort } from '@/composables/useSort'
import RarityBadge from '@/components/common/RarityBadge.vue'
import SortableTable from '@/components/tables/SortableTable.vue'
import Modal from '@/components/common/Modal.vue'
import type { ColumnDef } from '@/components/tables/types'
import type { Brainrot } from '@/types/brainrot'
import type { RarityConfig } from '@/types/rarity'

const ESTEIRA_MULTIPLIER = 1.5
const ESTEIRA_CLICKS = 10
const FALLBACK_RARITY_COLOR = '#888888'

type ColKey = 'name' | 'rarity' | 'valuePerSec' | 'buyValue' | '_be'

const {
  data: brainrotData,
  loading: loadingBrainrots,
  error: errorBrainrots,
} = useJsonData<Brainrot[]>('/data/brainrots.json')
const {
  data: rarityData,
  loading: loadingRarities,
  error: errorRarities,
} = useJsonData<RarityConfig[]>('/data/rarities.json')
const { formatCompact, formatBreakEven, breakEvenSeconds } = useNumberFormat()

const loading = computed(() => loadingBrainrots.value || loadingRarities.value)
const error = computed(() => errorBrainrots.value ?? errorRarities.value)

const rarityByName = computed(() => new Map((rarityData.value ?? []).map((r) => [r.name, r])))

const columns: ColumnDef<ColKey>[] = [
  { key: 'name', label: 'Nome' },
  { key: 'rarity', label: 'Raridade' },
  { key: 'valuePerSec', label: 'Coins/s', numeric: true },
  { key: 'buyValue', label: 'Valor de Compra', numeric: true },
  { key: '_be', label: 'Break-Even', numeric: true },
]

const brainrots = computed(() => brainrotData.value ?? [])

const { sortState, sorted, toggleSort } = useSort<Brainrot, ColKey>(
  brainrots,
  { col: 'buyValue', asc: false },
  (item, col) => {
    switch (col) {
      case 'name':
        return item.name
      case 'rarity':
        return rarityByName.value.get(item.rarity)?.rank ?? -1
      case 'valuePerSec':
        return item.valuePerSec
      case 'buyValue':
        return item.buyValue
      case '_be':
        return breakEvenSeconds(item.buyValue, item.valuePerSec)
    }
  },
  ['_be'],
)

const esteiraBrainrot = ref<Brainrot | null>(null)

const esteiraRows = computed(() => {
  if (!esteiraBrainrot.value) return []
  const buyValue = esteiraBrainrot.value.buyValue
  return Array.from({ length: ESTEIRA_CLICKS }, (_, i) => ({
    click: i + 1,
    cost: buyValue * ESTEIRA_MULTIPLIER ** i,
  }))
})
</script>

<template>
  <h1 class="mb-4 text-xl font-semibold text-heading">Brainrots</h1>

  <p v-if="loading" class="text-muted">Carregando...</p>
  <p v-else-if="error" class="text-accent-danger">Erro ao carregar dados: {{ error }}</p>

  <SortableTable
    v-else
    :columns="columns"
    :rows="sorted"
    :sort-state="sortState"
    @sort="toggleSort($event as ColKey)"
  >
    <template #cell-name="{ row }">
      <div class="flex items-center gap-2">
        <img
          :src="`/icons/mobs/${row.icon}`"
          :alt="row.mob"
          class="h-8 w-8 rounded object-contain [image-rendering:pixelated]"
        />
        <span>{{ row.name }} <span class="text-muted">({{ row.mob }})</span></span>
      </div>
    </template>

    <template #cell-rarity="{ row }">
      <RarityBadge :rarity="row.rarity" :color="rarityByName.get(row.rarity)?.color ?? FALLBACK_RARITY_COLOR" />
    </template>

    <template #cell-valuePerSec="{ row }">
      {{ formatCompact(row.valuePerSec) }}
    </template>

    <template #cell-buyValue="{ row }">
      <span class="cursor-pointer text-accent-green" @click="esteiraBrainrot = row">{{ formatCompact(row.buyValue) }}</span>
      <button
        class="ml-1.5 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-border-hover text-[10px] text-faint hover:border-body hover:text-body"
        title="Custo na esteira"
        @click="esteiraBrainrot = row"
      >
        i
      </button>
    </template>

    <template #cell-_be="{ row }">
      {{ formatBreakEven(row.buyValue, row.valuePerSec) }}
    </template>
  </SortableTable>

  <Modal
    v-if="esteiraBrainrot"
    :title="`${esteiraBrainrot.name}`"
    @close="esteiraBrainrot = null"
  >
    <p class="text-sm text-muted">Cada clique custa 50% a mais que o anterior</p>
    <div class="overflow-hidden rounded-xl border border-border">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="border-b border-border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-faint">
              Clique
            </th>
            <th class="border-b border-border px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Custo
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in esteiraRows" :key="r.click" class="last:[&>td]:border-b-0">
            <td class="border-b border-border-table px-4 py-2 text-left">{{ r.click }}º clique</td>
            <td class="border-b border-border-table px-4 py-2 text-right text-accent-green">
              {{ formatCompact(r.cost, 2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Modal>
</template>
