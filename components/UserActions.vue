<template>
  <div class="hidden md:flex items-center space-x-4">
    <div class="text-sm text-gray-600">
      {{ user?.name }}
    </div>
    <Button 
      variant="ghost"
      size="sm"
      @click="handleLogout"
    >
      Выйти
    </Button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user?: {
    name: string
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  logout: []
}>()

const handleLogout = () => {
  emit('logout')
}
</script>
