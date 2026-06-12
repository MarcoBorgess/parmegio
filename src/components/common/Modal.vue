<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="$emit('close')">
      <div
        class="flex max-h-[90vh] w-[420px] max-w-[calc(100vw-32px)] flex-col gap-3.5 overflow-y-auto rounded-2xl border border-border bg-surface p-6"
      >
        <div class="flex items-center justify-between text-base font-bold text-heading">
          <span>{{ title }}</span>
          <button class="text-lg leading-none text-faint hover:text-body" @click="$emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
