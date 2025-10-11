<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Инициализация приложения
onMounted(() => {
  // Инициализация аутентификации
  const authStore = useAuthStore()
  authStore.initAuth()
})
</script>
