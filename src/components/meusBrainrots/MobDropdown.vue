<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Brainrot } from '@/types/brainrot'
import type { RarityConfig } from '@/types/rarity'

const props = defineProps<{
  brainrots: Brainrot[]
  rarities: RarityConfig[]
  modelValue: string | null
  placeholder: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)

const selected = computed(() => props.brainrots.find((b) => b.name === props.modelValue) ?? null)

const groups = computed(() => {
  return [...props.rarities]
    .sort((a, b) => b.rank - a.rank)
    .map((rarity) => ({
      rarity,
      items: props.brainrots
        .filter((b) => b.rarity === rarity.name)
        .sort((a, b) => b.valuePerSec - a.valuePerSec),
    }))
    .filter((group) => group.items.length > 0)
})

function toggle() {
  open.value = !open.value
}

function select(name: string) {
  emit('update:modelValue', name)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <div
      class="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-input px-3 py-2 text-sm hover:border-border-hover"
      :class="{ 'rounded-b-none border-border-hover': open }"
      @click="toggle"
    >
      <img
        v-if="selected"
        :src="`/icons/mobs/${selected.icon}`"
        :alt="selected.mob"
        class="h-6 w-6 shrink-0 object-contain [image-rendering:pixelated]"
      />
      <span class="flex-1 truncate" :class="selected ? 'text-body' : 'text-faint'">
        {{ selected ? selected.name : placeholder }}
      </span>
      <span class="shrink-0 text-xs text-faint">▾</span>
    </div>

    <div
      v-if="open"
      class="absolute z-10 max-h-72 w-full overflow-y-auto rounded-b-md border border-t-0 border-border-hover bg-surface-input shadow-[0_8px_24px_rgba(0,0,0,0.4)] [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-border"
    >
      <template v-for="group in groups" :key="group.rarity.name">
        <div class="px-3 py-1 text-xs font-semibold uppercase tracking-wide" :style="{ color: group.rarity.color }">
          {{ group.rarity.name }}
        </div>
        <div
          v-for="b in group.items"
          :key="b.name"
          class="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-hover"
          :class="{ 'bg-surface-hover': b.name === modelValue }"
          @click="select(b.name)"
        >
          <img :src="`/icons/mobs/${b.icon}`" :alt="b.mob" class="h-6 w-6 shrink-0 object-contain [image-rendering:pixelated]" />
          <span class="truncate text-body">{{ b.name }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
