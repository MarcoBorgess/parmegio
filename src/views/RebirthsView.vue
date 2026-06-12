<script setup lang="ts">
import { computed } from 'vue'
import { useJsonData } from '@/composables/useJsonData'
import { useNumberFormat } from '@/composables/useNumberFormat'
import type { Brainrot } from '@/types/brainrot'
import type { Rebirth, RebirthWithTotals } from '@/types/rebirth'

const { data: rebirths, loading: loadingRebirths, error: errorRebirths } =
  useJsonData<Rebirth[]>('/data/rebirths.json')
const { data: brainrots, loading: loadingBrainrots, error: errorBrainrots } =
  useJsonData<Brainrot[]>('/data/brainrots.json')

const { formatCompact } = useNumberFormat()

const loading = computed(() => loadingRebirths.value || loadingBrainrots.value)
const error = computed(() => errorRebirths.value ?? errorBrainrots.value)

const rows = computed<RebirthWithTotals[]>(() => {
  if (!rebirths.value || !brainrots.value) return []

  const buyValueByName = new Map(brainrots.value.map((b) => [b.name, b.buyValue]))

  let cumulativeTotal = 0
  return [...rebirths.value]
    .sort((a, b) => a.level - b.level)
    .map((rebirth) => {
      const brainrotsCost = rebirth.neededBrainrots.reduce(
        (sum, nb) => sum + nb.qty * (buyValueByName.get(nb.name) ?? 0),
        0,
      )
      const total = rebirth.cost + brainrotsCost
      cumulativeTotal += total

      return { ...rebirth, brainrotsCost, total, cumulativeTotal }
    })
})
</script>

<template>
  <h1 class="mb-4 text-xl font-semibold text-heading">Rebirths</h1>

  <p v-if="loading" class="text-muted">Carregando...</p>
  <p v-else-if="error" class="text-accent-danger">Erro ao carregar dados: {{ error }}</p>

  <div
    v-else
    class="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            <th class="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-faint">
              Nível
            </th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Mult. Coins
            </th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Mult. Tokens
            </th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Custo
            </th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Custo Brainrots
            </th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Total
            </th>
            <th class="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-faint">
              Total Acumulado
            </th>
            <th class="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-faint">
              Brainrots Necessários
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.level"
            class="last:[&>td]:border-b-0 hover:bg-surface-hover"
          >
            <td class="border-b border-border-table px-4 py-2.5 text-left font-semibold text-heading">
              {{ row.level }}
            </td>
            <td class="border-b border-border-table px-4 py-2.5 text-right text-accent-green">{{ row.coinsMultiplier }}x</td>
            <td class="border-b border-border-table px-4 py-2.5 text-right text-accent-token">{{ row.tokensMultiplier }}x</td>
            <td class="border-b border-border-table px-4 py-2.5 text-right">{{ formatCompact(row.cost) }}</td>
            <td class="border-b border-border-table px-4 py-2.5 text-right">{{ formatCompact(row.brainrotsCost) }}</td>
            <td class="border-b border-border-table px-4 py-2.5 text-right text-accent-green">{{ formatCompact(row.total) }}</td>
            <td class="border-b border-border-table px-4 py-2.5 text-right font-semibold text-accent-green-dark">
              {{ formatCompact(row.cumulativeTotal) }}
            </td>
            <td class="border-b border-border-table px-4 py-2.5 text-left">
              <div v-for="nb in row.neededBrainrots" :key="nb.name">{{ nb.qty }}x {{ nb.name }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
