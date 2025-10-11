<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Создать аккаунт
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Или
          <button @click="$emit('switch-to-login')" class="font-medium text-indigo-600 hover:text-indigo-500">
            войдите в существующий аккаунт
          </button>
        </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Имя
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Введите ваше имя"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Введите ваш email"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Минимум 6 символов"
            />
          </div>

          <!-- Currency -->
          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700">
              Валюта
            </label>
            <select
              id="currency"
              v-model="form.currency"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="RUB">Рубль (RUB)</option>
              <option value="USD">Доллар (USD)</option>
              <option value="EUR">Евро (EUR)</option>
            </select>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <Icon name="loader-2" class="animate-spin h-4 w-4 mr-2" />
              Регистрация...
            </span>
            <span v-else>Создать аккаунт</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterForm } from '~/stores/useAuthStore'

const emit = defineEmits<{
  'switch-to-login': []
  'register-success': []
}>()

const authStore = useAuthStore()

const form = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
  currency: 'RUB'
})

const error = ref('')
const loading = computed(() => authStore.loading)

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.email.trim() !== '' && 
         form.value.password.trim() !== '' &&
         form.value.password.length >= 6
})

const handleSubmit = async () => {
  error.value = ''
  
  try {
    await authStore.register(form.value)
    emit('register-success')
  } catch (err: any) {
    error.value = err.data?.message || 'Ошибка при регистрации'
  }
}
</script>
