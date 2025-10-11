export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  
  // На клиенте инициализируем аутентификацию из localStorage
  if (process.client) {
    authStore.initAuth()
    
    // Ждем инициализации аутентификации
    await nextTick()
  }
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth')
  }
})
