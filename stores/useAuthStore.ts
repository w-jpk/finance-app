import { defineStore } from 'pinia'
import type { User } from '~/types'

export interface AuthUser extends User {
  id: string
  name: string
  email: string
  currency: string
  initialBalance: number
  createdAt: Date
  updatedAt: Date
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  currency?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // Инициализация из localStorage и cookies
  const initAuth = () => {
    if (process.client) {
      // Сначала проверяем localStorage
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        return
      }
      
      // Если в localStorage нет, проверяем cookies
      const tokenCookie = useCookie('auth_token')
      const userCookie = useCookie('auth_user')
      
      if (tokenCookie.value && userCookie.value) {
        token.value = tokenCookie.value
        user.value = JSON.parse(userCookie.value)
        
        // Синхронизируем с localStorage
        localStorage.setItem('auth_token', tokenCookie.value)
        localStorage.setItem('auth_user', userCookie.value)
      }
    }
  }

  // Сохранение в localStorage и cookies
  const saveAuth = (userData: AuthUser, authToken: string) => {
    if (process.client) {
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // Также сохраняем в cookies для SSR
      const tokenCookie = useCookie('auth_token', {
        default: () => null,
        maxAge: 60 * 60 * 24 * 7 // 7 дней
      })
      const userCookie = useCookie('auth_user', {
        default: () => null,
        maxAge: 60 * 60 * 24 * 7 // 7 дней
      })
      
      tokenCookie.value = authToken
      userCookie.value = JSON.stringify(userData)
    }
    user.value = userData
    token.value = authToken
  }

  // Установка пользователя (для SSR)
  const setUser = (userData: AuthUser, authToken: string) => {
    user.value = userData
    token.value = authToken
  }

  // Очистка аутентификации
  const clearAuth = () => {
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Также очищаем cookies
      const tokenCookie = useCookie('auth_token')
      const userCookie = useCookie('auth_user')
      
      tokenCookie.value = null
      userCookie.value = null
    }
    user.value = null
    token.value = null
  }

  // Регистрация
  const register = async (form: RegisterForm) => {
    loading.value = true
    try {
      const response = await $fetch<{ user: AuthUser; token: string }>('/api/auth/register', {
        method: 'POST',
        body: form
      })
      
      saveAuth(response.user, response.token)
      return response.user
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Логин
  const login = async (form: LoginForm) => {
    loading.value = true
    try {
      const response = await $fetch<{ user: AuthUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: form
      })
      
      saveAuth(response.user, response.token)
      return response.user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Логаут
  const logout = () => {
    clearAuth()
  }

  // Получение текущего пользователя
  const getCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const userData = await $fetch<AuthUser>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      user.value = userData
      return userData
    } catch (error) {
      console.error('Error fetching current user:', error)
      clearAuth()
      return null
    }
  }

  // Обновление пользователя
  const updateUser = async (userData: Partial<AuthUser>) => {
    if (!token.value) throw new Error('Not authenticated')
    
    try {
      const updatedUser = await $fetch<AuthUser>('/api/user', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: userData
      })
      
      user.value = updatedUser
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
        
        // Также обновляем cookies
        const userCookie = useCookie('auth_user')
        userCookie.value = JSON.stringify(updatedUser)
      }
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    isAuthenticated,
    initAuth,
    setUser,
    register,
    login,
    logout,
    getCurrentUser,
    updateUser
  }
})
