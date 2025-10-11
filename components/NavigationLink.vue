<template>
  <NuxtLink 
    :to="to"
    class="flex items-center space-x-2"
    @click="$emit('click')"
  >
    <Icon :name="icon" class="w-4 h-4" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string
  icon: string
  label: string
  isActive?: boolean
}

defineProps<Props>()

defineEmits<{
  click: []
}>()
</script>
