<script setup lang="ts">
import { computed } from 'vue'
import { useNumberFormat } from '@/composables/useNumberFormat'
import GenerationCard from './GenerationCard.vue'
import type { Rebirth } from '@/types/rebirth'
import type { VipTier } from '@/types/vip'

const props = defineProps<{
  level: number
  currentRebirth: Rebirth | null
  nextRebirth: Rebirth | null
  nextRebirthBrainrotsCost: number
  vip: VipTier
  booster: number
  eventMulti: number
  totals: { afk: number; world: number; event: number }
}>()

defineEmits<{
  inc: []
  dec: []
}>()

const { formatCompact, formatDuration } = useNumberFormat()

const cm = computed(() => props.currentRebirth?.coinsMultiplier ?? 1)
const bonusPct = computed(() => Math.round((props.vip.bonus - 1) * 100))
const debuffPct = computed(() => Math.round((1 - props.vip.afkDebuff) * 100))

const nextTotal = computed(() => (props.nextRebirth ? props.nextRebirth.cost + props.nextRebirthBrainrotsCost : 0))
const nextTimeAfk = computed(() => (props.totals.afk > 0 ? formatDuration(nextTotal.value / props.totals.afk) : '—'))

const afkTooltip = computed(
  () =>
    `Coins/s × Rebirth × VIP bônus × AFK debuff\n\nRebirth: ${cm.value}x\nVIP bônus: +${bonusPct.value}%\nAFK debuff: -${debuffPct.value}%`,
)
const worldTooltip = computed(
  () =>
    `Coins/s × Rebirth × VIP bônus × Booster\n\nRebirth: ${cm.value}x\nVIP bônus: +${bonusPct.value}%\nBooster: ${props.booster}x`,
)
const eventTooltip = computed(
  () =>
    `Coins/s × Rebirth × VIP bônus × Booster × Multi Evento\n\nRebirth: ${cm.value}x\nVIP bônus: +${bonusPct.value}%\nBooster: ${props.booster}x\nMulti Evento: ${props.eventMulti}x`,
)
</script>

<template>
  <div class="mb-5 flex flex-wrap gap-3">
    <div class="flex min-w-[180px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 px-5">
      <div class="text-[0.72rem] font-semibold uppercase tracking-wide text-faint">Rebirth Atual</div>
      <div class="text-2xl font-bold leading-none text-heading">{{ level }}</div>
      <div class="flex flex-col items-center gap-0.5 text-sm text-muted">
        <template v-if="currentRebirth">
          <span>Coins <strong class="text-body">{{ currentRebirth.coinsMultiplier }}x</strong></span>
          <span>Tokens <strong class="text-body">{{ currentRebirth.tokensMultiplier }}x</strong></span>
        </template>
        <span v-else class="text-faint">Sem multiplicador</span>
      </div>
      <div class="mt-1 flex gap-1.5">
        <button
          class="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md border border-border bg-surface-input text-lg text-body hover:border-border-hover"
          @click="$emit('dec')"
        >
          −
        </button>
        <button
          class="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md border border-border bg-surface-input text-lg text-body hover:border-border-hover"
          @click="$emit('inc')"
        >
          +
        </button>
      </div>
    </div>

    <div v-if="nextRebirth" class="flex min-w-[180px] flex-1 flex-col justify-center gap-2 rounded-xl border border-border bg-surface p-4 px-5">
      <div class="text-[0.72rem] font-semibold uppercase tracking-wide text-faint">Próximo Rebirth ({{ nextRebirth.level }})</div>
      <div class="text-sm">
        Custo: <strong class="text-accent-green">{{ formatCompact(nextTotal, 2) }}</strong>
        <span class="text-xs text-faint">
          ({{ formatCompact(nextRebirth.cost, 2) }} + {{ formatCompact(nextRebirthBrainrotsCost, 2) }})
        </span>
      </div>
      <div class="text-xs leading-relaxed text-muted">
        <div v-for="nb in nextRebirth.neededBrainrots" :key="nb.name">{{ nb.qty }}x {{ nb.name }}</div>
      </div>
      <div class="text-sm text-muted">Tempo AFK: <strong class="text-body">{{ nextTimeAfk }}</strong></div>
    </div>

    <GenerationCard
      title="AFK"
      :hint="vip.label"
      :tooltip="afkTooltip"
      :value-per-sec="totals.afk"
      value-class="text-accent-green"
    />
    <GenerationCard
      title="Mundo"
      :hint="`${booster}x`"
      :tooltip="worldTooltip"
      :value-per-sec="totals.world"
      value-class="text-accent-green"
    />
    <GenerationCard
      title="Evento"
      :hint="`${booster}x · ${eventMulti}x`"
      :tooltip="eventTooltip"
      :value-per-sec="totals.event"
      value-class="text-accent-green"
    />
  </div>
</template>
