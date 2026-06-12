<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/common/Modal.vue'
import type { MbConfig } from '@/types/meusBrainrots'
import type { VipTier } from '@/types/vip'

const props = defineProps<{
  vipTiers: VipTier[]
  config: MbConfig
}>()

const emit = defineEmits<{
  save: [MbConfig]
  close: []
}>()

const vip = ref(props.config.vip)
const booster = ref(props.config.booster)
const eventMulti = ref(props.config.eventMulti)

function save() {
  emit('save', {
    vip: vip.value,
    booster: Number(booster.value) || 1,
    eventMulti: Number(eventMulti.value) || 1,
  })
}
</script>

<template>
  <Modal title="Configurar" @close="$emit('close')">
    <div class="flex flex-wrap gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-muted">VIP</label>
        <select v-model="vip" class="rounded-md border border-border bg-surface-input px-2.5 py-1.5 text-sm text-body focus:border-border-hover focus:outline-none">
          <option v-for="tier in vipTiers" :key="tier.id" :value="tier.id">{{ tier.label }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-muted">Booster</label>
        <input
          v-model.number="booster"
          type="number"
          min="1"
          step="0.01"
          class="w-[100px] rounded-md border border-border bg-surface-input px-2.5 py-1.5 text-sm text-body focus:border-border-hover focus:outline-none"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-muted">Multi Evento</label>
        <input
          v-model.number="eventMulti"
          type="number"
          min="1"
          step="0.01"
          class="w-[100px] rounded-md border border-border bg-surface-input px-2.5 py-1.5 text-sm text-body focus:border-border-hover focus:outline-none"
        />
      </div>
    </div>
    <button
      class="self-start rounded-md border border-border bg-surface-input px-5 py-2 text-sm text-body hover:border-border-hover"
      @click="save"
    >
      Salvar
    </button>
  </Modal>
</template>
