<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Настройки</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">Управление настройками приложения</p>
    </div>

    <!-- Профиль пользователя -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Профиль пользователя</h3>
      </div>
      
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Имя</label>
            <input 
              v-model="profileForm.name" 
              type="text" 
              class="input-field"
              placeholder="Введите ваше имя"
            />
          </div>
          
          <div>
            <label class="label">Email</label>
            <input 
              v-model="profileForm.email" 
              type="email" 
              class="input-field"
              placeholder="Введите ваш email"
            />
          </div>
        </div>
        
        <div>
          <label class="label">Валюта</label>
          <select v-model="profileForm.currency" class="input-field">
            <option value="RUB">Российский рубль (₽)</option>
            <option value="USD">Доллар США ($)</option>
            <option value="EUR">Евро (€)</option>
            <option value="KZT">Казахстанский тенге (₸)</option>
          </select>
        </div>
        
        <div class="flex justify-end">
          <Button type="submit" variant="primary" icon="lucide:save">
            Сохранить изменения
          </Button>
        </div>
      </form>
    </div>

    <!-- Настройки приложения -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Настройки приложения</h3>
      </div>
      
      <div class="space-y-6">
        <!-- Уведомления -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">Уведомления</h4>
          <div class="space-y-3">
            <label class="flex items-center">
              <input 
                v-model="settingsForm.notifications.budgetAlerts" 
                type="checkbox" 
                class="mr-3"
              />
              <span class="text-sm text-gray-700">Уведомления о превышении бюджета</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="settingsForm.notifications.goalReminders" 
                type="checkbox" 
                class="mr-3"
              />
              <span class="text-sm text-gray-700">Напоминания о целях</span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="settingsForm.notifications.weeklyReports" 
                type="checkbox" 
                class="mr-3"
              />
              <span class="text-sm text-gray-700">Еженедельные отчеты</span>
            </label>
          </div>
        </div>

        <!-- Внешний вид -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">Внешний вид</h4>
          <div class="space-y-3">
            <div>
              <label class="label">Тема</label>
              <select v-model="settingsForm.theme" class="input-field">
                <option value="light">Светлая</option>
                <option value="dark">Темная</option>
                <option value="auto">Автоматическая</option>
              </select>
            </div>
            
            <div>
              <label class="label">Язык</label>
              <select v-model="settingsForm.language" class="input-field">
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="kz">Қазақша</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Данные -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4">Данные</h4>
          <div class="space-y-3">
            <Button 
              variant="secondary"
              icon="lucide:download"
              @click="exportData"
            >
              Экспорт данных
            </Button>
            
            <Button 
              variant="secondary"
              icon="lucide:upload"
              @click="importData"
            >
              Импорт данных
            </Button>
            
            <Button 
              variant="danger"
              icon="lucide:trash-2"
              @click="clearAllData"
            >
              Очистить все данные
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика приложения -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Статистика приложения</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ appStats.totalTransactions }}</div>
          <div class="text-sm text-gray-600">Всего транзакций</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ appStats.totalCategories }}</div>
          <div class="text-sm text-gray-600">Категорий</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ appStats.totalGoals }}</div>
          <div class="text-sm text-gray-600">Целей</div>
        </div>
      </div>
    </div>

    <!-- О приложении -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">О приложении</h3>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Версия</span>
          <span class="text-sm font-medium text-gray-900">1.0.0</span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Создано</span>
          <span class="text-sm font-medium text-gray-900">2024</span>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Технологии</span>
          <span class="text-sm font-medium text-gray-900">Nuxt 3, TypeScript, Tailwind CSS</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Защита страницы аутентификацией
definePageMeta({
  middleware: 'auth'
})

import { useAuthStore } from '~/stores/useAuthStore'
import { useTransactionStore } from '~/stores/useTransactionStore'
import { useCategoryStore } from '~/stores/useCategoryStore'
import { useGoalStore } from '~/stores/useGoalStore'

// Stores
const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const goalStore = useGoalStore()

// Форма профиля
const profileForm = ref({
  name: '',
  email: '',
  currency: 'RUB'
})

// Настройки приложения
const settingsForm = ref({
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false
  },
  theme: 'light',
  language: 'ru'
})

// Статистика приложения
const appStats = computed(() => ({
  totalTransactions: transactionStore.transactions.length,
  totalCategories: categoryStore.categories.length,
  totalGoals: goalStore.goals.length
}))

// Методы
const updateProfile = async () => {
  try {
    await authStore.updateUser(profileForm.value)
    // Показать уведомление об успехе
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)
  }
}

const exportData = () => {
  const data = {
    transactions: transactionStore.transactions,
    categories: categoryStore.categories,
    goals: goalStore.goals,
    user: authStore.user,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          // Импорт данных (в реальном приложении здесь была бы логика импорта)
          console.log('Импортированные данные:', data)
        } catch (error) {
          console.error('Ошибка при импорте данных:', error)
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const clearAllData = () => {
  if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
    // Очистка всех данных (в реальном приложении здесь была бы логика очистки)
    console.log('Очистка всех данных')
  }
}

// Инициализация
onMounted(async () => {
  // Инициализация аутентификации уже происходит в layout
  // Загрузка данных профиля
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name,
      email: authStore.user.email,
      currency: authStore.user.currency
    }
  }
})
</script>
