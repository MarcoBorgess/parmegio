<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useJsonData } from '@/composables/useJsonData'
import { useMeusBrainrotsStore } from '@/stores/meusBrainrots'
import SummaryCards from '@/components/meusBrainrots/SummaryCards.vue'
import LoadoutTable, { type LoadoutRow } from '@/components/meusBrainrots/LoadoutTable.vue'
import ConfigModal from '@/components/meusBrainrots/ConfigModal.vue'
import PurchaseCalculator from '@/components/meusBrainrots/PurchaseCalculator.vue'
import type { Brainrot } from '@/types/brainrot'
import type { Rebirth } from '@/types/rebirth'
import type { RarityConfig } from '@/types/rarity'
import type { VipTier } from '@/types/vip'
import type { MbConfig } from '@/types/meusBrainrots'

const FALLBACK_RARITY_COLOR = '#888888'
const DEFAULT_VIP: VipTier = { id: 'none', label: 'Sem VIP', bonus: 1, afkDebuff: 0.75 }

const { data: brainrotData, loading: loadingBrainrots, error: errorBrainrots } =
  useJsonData<Brainrot[]>('/data/brainrots.json')
const { data: rebirthData, loading: loadingRebirths, error: errorRebirths } =
  useJsonData<Rebirth[]>('/data/rebirths.json')
const { data: rarityData, loading: loadingRarities, error: errorRarities } =
  useJsonData<RarityConfig[]>('/data/rarities.json')
const { data: vipData, loading: loadingVip, error: errorVip } = useJsonData<VipTier[]>('/data/vip.json')

const loading = computed(
  () => loadingBrainrots.value || loadingRebirths.value || loadingRarities.value || loadingVip.value,
)
const error = computed(() => errorBrainrots.value ?? errorRebirths.value ?? errorRarities.value ?? errorVip.value)

const brainrots = computed(() => brainrotData.value ?? [])
const rebirths = computed(() => rebirthData.value ?? [])
const rarities = computed(() => rarityData.value ?? [])
const vipTiers = computed(() => vipData.value ?? [])

const store = useMeusBrainrotsStore()

const brainrotByName = computed(() => new Map(brainrots.value.map((b) => [b.name, b])))
const rarityByName = computed(() => new Map(rarities.value.map((r) => [r.name, r])))

const currentRebirth = computed(() => rebirths.value.find((r) => r.level === store.rebirthLevel) ?? null)
const nextRebirth = computed(() => rebirths.value.find((r) => r.level === store.rebirthLevel + 1) ?? null)

const nextRebirthBrainrotsCost = computed(() => {
  if (!nextRebirth.value) return 0
  return nextRebirth.value.neededBrainrots.reduce(
    (sum, nb) => sum + nb.qty * (brainrotByName.value.get(nb.name)?.buyValue ?? 0),
    0,
  )
})

const vip = computed(
  () =>
    vipTiers.value.find((v) => v.id === store.config.vip) ??
    vipTiers.value.find((v) => v.id === 'none') ??
    DEFAULT_VIP,
)

const cm = computed(() => currentRebirth.value?.coinsMultiplier ?? 1)

const totals = computed(() => {
  let afk = 0
  let world = 0
  let event = 0
  for (const entry of store.loadout) {
    const b = brainrotByName.value.get(entry.name)
    if (!b) continue
    const cps = b.valuePerSec
    afk += cps * cm.value * vip.value.bonus * vip.value.afkDebuff * entry.qty
    world += cps * cm.value * vip.value.bonus * store.config.booster * entry.qty
    event += cps * cm.value * vip.value.bonus * store.config.booster * store.config.eventMulti * entry.qty
  }
  return { afk, world, event }
})

const loadoutRows = computed<LoadoutRow[]>(() => {
  return store.loadout
    .map((entry) => {
      const b = brainrotByName.value.get(entry.name)
      if (!b) return null
      const cps = b.valuePerSec
      return {
        name: entry.name,
        icon: b.icon,
        mob: b.mob,
        color: rarityByName.value.get(b.rarity)?.color ?? FALLBACK_RARITY_COLOR,
        qty: entry.qty,
        cost: b.buyValue * entry.qty,
        afkPs: cps * cm.value * vip.value.bonus * vip.value.afkDebuff * entry.qty,
        evtPs: cps * cm.value * vip.value.bonus * store.config.booster * store.config.eventMulti * entry.qty,
      }
    })
    .filter((row): row is LoadoutRow => row !== null)
    .sort((a, b) => (brainrotByName.value.get(b.name)?.valuePerSec ?? 0) - (brainrotByName.value.get(a.name)?.valuePerSec ?? 0))
})

const showConfigModal = ref(false)

onMounted(() => {
  if (!store.hasConfig) showConfigModal.value = true
})

function handleSaveConfig(config: MbConfig) {
  store.saveConfig(config)
  showConfigModal.value = false
}
</script>

<template>
  <div class="mb-4 flex items-center justify-between">
    <h1 class="text-xl font-semibold text-heading">Meus Brainrots</h1>
    <button
      class="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface-input px-3 py-1.5 text-sm text-body hover:border-border-hover hover:bg-surface-hover"
      @click="showConfigModal = true"
    >
      <span>⚙</span>
      <span>Configurar</span>
    </button>
  </div>

  <p v-if="loading" class="text-muted">Carregando...</p>
  <p v-else-if="error" class="text-accent-danger">Erro ao carregar dados: {{ error }}</p>

  <template v-else>
    <SummaryCards
      :level="store.rebirthLevel"
      :current-rebirth="currentRebirth"
      :next-rebirth="nextRebirth"
      :next-rebirth-brainrots-cost="nextRebirthBrainrotsCost"
      :vip="vip"
      :booster="store.config.booster"
      :event-multi="store.config.eventMulti"
      :totals="totals"
      @inc="store.setLevel(store.rebirthLevel + 1)"
      @dec="store.setLevel(store.rebirthLevel - 1)"
    />

    <LoadoutTable
      :rows="loadoutRows"
      :brainrots="brainrots"
      :rarities="rarities"
      @update-qty="(name, qty) => store.setQty(name, qty)"
      @remove="(name) => store.removeFromLoadout(name)"
      @add="store.addToLoadout($event)"
    />

    <PurchaseCalculator
      :brainrots="brainrots"
      :rarities="rarities"
      :rebirths="rebirths"
      :vip-tiers="vipTiers"
      :initial-vip="store.config.vip"
      :initial-level="store.rebirthLevel"
      :initial-booster="store.config.booster"
      :initial-event-multi="store.config.eventMulti"
    />
  </template>

  <ConfigModal
    v-if="showConfigModal"
    :vip-tiers="vipTiers"
    :config="store.config"
    @save="handleSaveConfig"
    @close="showConfigModal = false"
  />
</template>
