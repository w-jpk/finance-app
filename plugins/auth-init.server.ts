export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // На сервере проверяем cookies и устанавливаем пользователя
  if (process.server) {
    const tokenCookie = useCookie('auth_token')
    const userCookie = useCookie('auth_user')
    
    if (tokenCookie.value && userCookie.value) {
      try {
        // Проверяем токен на сервере
        const response = await $fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${tokenCookie.value}`
          }
        })
        
        // Если токен валидный, устанавливаем пользователя
        authStore.setUser(response, tokenCookie.value)
      } catch (error) {
        // Токен невалидный, очищаем cookies
        tokenCookie.value = null
        userCookie.value = null
      }
    }
  }
})
