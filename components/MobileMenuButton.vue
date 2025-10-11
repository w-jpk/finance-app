<template>
  <div class="md:hidden">
    <Button 
      variant="ghost"
      size="md"
      icon="lucide:menu"
      @click="toggleMenu"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()

const toggleMenu = () => {
  emit('toggle')
}
</script>
