<script setup lang="ts">
defineProps<{
  rarity: string
  color: string
}>()
</script>

<template>
  <span
    class="inline-block rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide"
    :style="{ color, borderColor: `${color}4d`, backgroundColor: `${color}1a` }"
  >
    {{ rarity }}
  </span>
</template>
