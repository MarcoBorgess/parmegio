<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNumberFormat } from '@/composables/useNumberFormat'
import MobDropdown from './MobDropdown.vue'
import SpinnerInput from '@/components/common/SpinnerInput.vue'
import type { Brainrot } from '@/types/brainrot'
import type { RarityConfig } from '@/types/rarity'
import type { Rebirth } from '@/types/rebirth'
import type { VipTier } from '@/types/vip'

const props = defineProps<{
  brainrots: Brainrot[]
  rarities: RarityConfig[]
  rebirths: Rebirth[]
  vipTiers: VipTier[]
  initialVip: string
  initialLevel: number
  initialBooster: number
  initialEventMulti: number
}>()

const { formatCompact, formatDuration, parseNotation } = useNumberFormat()

const selectedMob = ref<string | null>(null)
const vip = ref(props.initialVip)
const rebirthLevel = ref(props.initialLevel)
const booster = ref(props.initialBooster)
const cost = ref('')
const afkHours = ref(20)
const mundoHours = ref(4)
const eventos = ref(2)
const eventoMulti = ref(props.initialEventMulti)

const maxRebirth = computed(() => (props.rebirths.length ? Math.max(...props.rebirths.map((r) => r.level)) : 25))

const vipTier = computed(() => props.vipTiers.find((v) => v.id === vip.value) ?? props.vipTiers[0])
const cm = computed(() => props.rebirths.find((r) => r.level === rebirthLevel.value)?.coinsMultiplier ?? 1)
const selectedBrainrot = computed(() => props.brainrots.find((b) => b.name === selectedMob.value) ?? null)

const bonusPct = computed(() => Math.round((vipTier.value.bonus - 1) * 100))
const debuffPct = computed(() => Math.round((1 - vipTier.value.afkDebuff) * 100))
const offlineHours = computed(() => Math.max(0, 24 - afkHours.value - mundoHours.value))

watch(selectedMob, () => {
  if (selectedBrainrot.value) cost.value = formatCompact(selectedBrainrot.value.buyValue)
})

const custo = computed(() => parseNotation(cost.value))

const results = computed(() => {
  if (!selectedBrainrot.value) return null
  const cps = selectedBrainrot.value.valuePerSec
  const mundoEf = Math.max(0, mundoHours.value - eventos.value)
  const afkDaily = cps * cm.value * vipTier.value.bonus * vipTier.value.afkDebuff * afkHours.value * 3600
  const mundoDaily = cps * cm.value * vipTier.value.bonus * booster.value * mundoEf * 3600
  const evtDaily = cps * cm.value * vipTier.value.bonus * booster.value * eventoMulti.value * eventos.value * 3600
  return { afkDaily, mundoDaily, evtDaily, totalDaily: afkDaily + mundoDaily + evtDaily }
})

const breakEvenText = computed(() => {
  if (!results.value) return '—'
  const { totalDaily } = results.value
  return totalDaily > 0 && custo.value > 0 ? formatDuration(custo.value / (totalDaily / 86400)) : '—'
})

function onAfkInput(value: number) {
  const afk = Math.max(0, Math.min(24, Math.round(value)))
  afkHours.value = afk
  if (afk + mundoHours.value > 24) mundoHours.value = 24 - afk
  eventos.value = Math.min(eventos.value, mundoHours.value)
}

function onMundoInput(value: number) {
  const mundo = Math.max(0, Math.min(24, Math.round(value)))
  mundoHours.value = mundo
  if (afkHours.value + mundo > 24) afkHours.value = 24 - mundo
  eventos.value = Math.min(eventos.value, mundo)
}

function onEventosInput(value: number) {
  eventos.value = Math.max(0, Math.min(mundoHours.value, Math.round(value)))
}

function onRebirthInput(value: number) {
  rebirthLevel.value = Math.max(0, Math.min(maxRebirth.value, Math.round(value)))
}
</script>

<template>
  <h2 class="mb-3 mt-8 text-lg font-semibold text-heading">Calculadora de Compra</h2>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
    <div class="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-surface p-4 px-5">
      <MobDropdown
        v-model="selectedMob"
        :brainrots="brainrots"
        :rarities="rarities"
        placeholder="Selecione um brainrot..."
      />
      <div class="flex flex-1 flex-col gap-1.5">
        <div class="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-input px-3 py-2">
          <span class="text-xs uppercase tracking-wide text-faint">AFK / dia</span>
          <span class="text-[0.95rem] font-bold text-accent-teal">{{ results ? formatCompact(results.afkDaily, 2) : '—' }}</span>
        </div>
        <div class="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-input px-3 py-2">
          <span class="text-xs uppercase tracking-wide text-faint">Mundo / dia</span>
          <span class="text-[0.95rem] font-bold text-accent-teal">{{ results ? formatCompact(results.mundoDaily, 2) : '—' }}</span>
        </div>
        <div class="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-input px-3 py-2">
          <span class="text-xs uppercase tracking-wide text-faint">Evento / dia</span>
          <span class="text-[0.95rem] font-bold text-accent-teal">{{ results ? formatCompact(results.evtDaily, 2) : '—' }}</span>
        </div>
        <div class="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-input px-3 py-2">
          <span class="text-xs uppercase tracking-wide text-faint">Total / dia</span>
          <span class="text-[0.95rem] font-bold text-accent-teal">{{ results ? formatCompact(results.totalDaily, 2) : '—' }}</span>
        </div>
        <div class="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-input px-3 py-2">
          <span class="text-xs uppercase tracking-wide text-faint">Break-Even</span>
          <span class="text-[0.95rem] font-bold text-accent-token">{{ breakEvenText }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-surface p-4 px-5">
      <div class="border-b border-border-table pb-2 text-xs font-semibold uppercase tracking-wide text-faint">1. Configurações</div>
      <div class="grid flex-1 grid-cols-[1fr_128px_auto] items-center gap-x-2.5 gap-y-2.5">
        <span class="text-sm font-semibold text-muted">VIP</span>
        <select
          v-model="vip"
          class="w-full rounded-md border border-border bg-surface-input px-2 py-1.5 text-sm text-body focus:border-border-hover focus:outline-none"
        >
          <option v-for="tier in vipTiers" :key="tier.id" :value="tier.id">{{ tier.label }}</option>
        </select>
        <div class="flex flex-col items-start gap-px text-[0.72rem] text-faint">
          <span>+{{ bonusPct }}% Coins</span>
          <span>−{{ debuffPct }}% AFK</span>
        </div>

        <span class="text-sm font-semibold text-muted">Rebirth</span>
        <SpinnerInput :model-value="rebirthLevel" :min="0" :max="maxRebirth" :step="1" @update:model-value="onRebirthInput" />
        <span class="text-[0.72rem] text-faint">{{ cm }}x Coins</span>

        <span class="text-sm font-semibold text-muted">Booster</span>
        <SpinnerInput v-model="booster" :min="1" :step="0.01" />
        <span class="text-xs text-faint">x</span>

        <span class="text-sm font-semibold text-muted">Custo</span>
        <input
          v-model="cost"
          type="text"
          placeholder="0"
          class="w-full rounded-md border border-border bg-surface-input px-2 py-1.5 text-right text-sm text-accent-green focus:border-border-hover focus:outline-none"
        />
        <span class="text-xs text-faint">Coins</span>
      </div>
    </div>

    <div class="flex flex-1 flex-col justify-between gap-2.5 rounded-xl border border-border bg-surface p-4 px-5">
      <div class="border-b border-border-table pb-2 text-xs font-semibold uppercase tracking-wide text-faint">2. Geração Diária</div>
      <div class="flex items-center gap-2 text-sm">
        <span class="flex-1 font-semibold text-muted">AFK</span>
        <SpinnerInput :model-value="afkHours" :min="0" :max="24" :step="1" class="w-32 shrink-0" @update:model-value="onAfkInput" />
        <span class="min-w-[30px] text-xs text-faint">horas</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="flex-1 font-semibold text-muted">Mundo</span>
        <SpinnerInput :model-value="mundoHours" :min="0" :max="24" :step="1" class="w-32 shrink-0" @update:model-value="onMundoInput" />
        <span class="min-w-[30px] text-xs text-faint">horas</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="flex-1 font-semibold text-faint">Offline</span>
        <span class="w-32 shrink-0 text-right text-faint">{{ offlineHours }}</span>
        <span class="min-w-[30px] text-xs text-faint">horas</span>
      </div>
      <div class="mt-0.5 border-t border-border-table pt-2.5 text-[0.72rem] font-semibold uppercase tracking-wide text-faint">Eventos</div>
      <div class="flex items-center gap-2 text-sm">
        <span class="flex-1 font-semibold text-muted">Quantidade</span>
        <SpinnerInput :model-value="eventos" :min="0" :max="24" :step="1" class="w-32 shrink-0" @update:model-value="onEventosInput" />
        <span class="min-w-[30px] text-xs text-faint">/ dia</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="flex-1 font-semibold text-muted">Multiplicador</span>
        <SpinnerInput v-model="eventoMulti" :min="1" :step="0.01" class="w-32 shrink-0" />
        <span class="min-w-[30px] text-xs text-faint">x</span>
      </div>
    </div>
  </div>
</template>
