<script setup lang="ts">
const links = [
  { to: '/brainrots', label: 'Brainrots', icon: '/icons/zombie_head.png' },
  { to: '/rebirths', label: 'Rebirths', icon: '/icons/nether_star.png' },
  { to: '/meus-brainrots', label: 'Meus Brainrots', icon: '/icons/computer.webp' },
]
</script>

<template>
  <nav class="flex flex-wrap justify-center gap-1.5 border-b border-border bg-surface px-3 py-2.5 sm:px-6">
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="flex items-center gap-2 rounded-md border border-border bg-surface-input px-3 py-1.5 text-sm text-body hover:border-border-hover hover:bg-surface-hover"
      active-class="border-border-accent"
    >
      <img :src="link.icon" :alt="link.label" class="h-6 w-6 [image-rendering:pixelated]" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>
