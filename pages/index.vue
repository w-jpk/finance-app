<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Обзор финансов</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Управляйте своими доходами, расходами и целями</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <NuxtLink to="/transactions" class="w-full sm:w-auto">
          <Button variant="primary" icon="lucide:plus" class="w-full sm:w-auto">
            <span class="hidden sm:inline">Создать транзакцию</span>
            <span class="sm:hidden">Создать</span>
          </Button>
        </NuxtLink>
        <Button variant="secondary" icon="lucide:settings" @click="openBalanceModal" class="w-full sm:w-auto">
          <span class="hidden sm:inline">Настроить баланс</span>
          <span class="sm:hidden">Баланс</span>
        </Button>
      </div>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Общий баланс</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {{ formatCurrency(stats.balance) }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:wallet" class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
        </div>
        <div class="mt-4">
          <span 
            class="text-sm font-medium"
            :class="stats.monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ stats.monthlyBalance >= 0 ? '+' : '' }}{{ formatCurrency(stats.monthlyBalance) }}
          </span>
          <span class="text-sm text-gray-500 ml-2">за месяц</span>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Доходы</p>
            <p class="text-xl sm:text-2xl font-bold text-green-600 truncate">
              {{ formatCurrency(stats.totalIncome) }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:trending-up" class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm font-medium text-green-600">
            +{{ formatCurrency(stats.totalIncome) }}
          </span>
          <span class="text-sm text-gray-500 ml-2">за месяц</span>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Расходы</p>
            <p class="text-xl sm:text-2xl font-bold text-red-600 truncate">
              {{ formatCurrency(stats.totalExpenses) }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:trending-down" class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm font-medium text-red-600">
            -{{ formatCurrency(stats.totalExpenses) }}
          </span>
          <span class="text-sm text-gray-500 ml-2">за месяц</span>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Цели</p>
            <p class="text-xl sm:text-2xl font-bold text-blue-600 truncate">
              {{ goalsStats.completed }}/{{ goalsStats.total }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:target" class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm font-medium text-blue-600">
            {{ Math.round(goalsStats.completionRate) }}%
          </span>
          <span class="text-sm text-gray-500 ml-2">выполнено</span>
        </div>
      </div>
    </div>

    <!-- Графики и быстрые действия -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- График доходов и расходов -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Доходы и расходы</h3>
          <NuxtLink to="/reports" class="text-sm text-primary-600 hover:text-primary-700">
            Подробнее
          </NuxtLink>
        </div>
        <div class="h-64">
          <IncomeExpenseChart :data="chartData" />
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Быстрые действия</h3>
        <div class="space-y-2 sm:space-y-3">
          <NuxtLink 
            to="/transactions" 
            class="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="lucide:plus" class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div class="text-left min-w-0">
                <p class="font-medium text-gray-900 text-sm sm:text-base truncate">Создать транзакцию</p>
                <p class="text-xs sm:text-sm text-gray-600 truncate">Добавить доход или расход</p>
              </div>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          </NuxtLink>

          <button 
            @click="openBalanceModal"
            class="w-full flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="lucide:wallet" class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div class="text-left min-w-0">
                <p class="font-medium text-gray-900 text-sm sm:text-base truncate">Настроить баланс</p>
                <p class="text-xs sm:text-sm text-gray-600 truncate">Установить начальный баланс</p>
              </div>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          </button>

          <NuxtLink 
            to="/goals" 
            class="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="lucide:target" class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div class="text-left min-w-0">
                <p class="font-medium text-gray-900 text-sm sm:text-base truncate">Создать цель</p>
                <p class="text-xs sm:text-sm text-gray-600 truncate">Поставить финансовую цель</p>
              </div>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          </NuxtLink>

          <NuxtLink 
            to="/budget" 
            class="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="lucide:pie-chart" class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div class="text-left min-w-0">
                <p class="font-medium text-gray-900 text-sm sm:text-base truncate">Управление бюджетом</p>
                <p class="text-xs sm:text-sm text-gray-600 truncate">Настроить лимиты трат</p>
              </div>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          </NuxtLink>

          <NuxtLink 
            to="/calendar" 
            class="flex items-center justify-between p-3 sm:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="lucide:calendar" class="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div class="text-left min-w-0">
                <p class="font-medium text-gray-900 text-sm sm:text-base truncate">Календарь расходов</p>
                <p class="text-xs sm:text-sm text-gray-600 truncate">Планировать предстоящие платежи</p>
              </div>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Последние транзакции -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3 class="text-lg font-semibold text-gray-900">Последние транзакции</h3>
        <NuxtLink to="/transactions" class="text-sm text-primary-600 hover:text-primary-700 self-start sm:self-auto">
          Все транзакции
        </NuxtLink>
      </div>
      
      <div v-if="recentTransactions.length === 0" class="text-center py-8">
        <Icon name="lucide:receipt" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Пока нет транзакций</p>
        <p class="text-sm text-gray-400 mt-1">Добавьте первую транзакцию, чтобы начать учет</p>
      </div>
      
      <div v-else class="space-y-4">
        <TransactionCard
          v-for="transaction in recentTransactions" 
          :key="transaction.id"
          :transaction="transaction"
          :category="transaction.category"
          @edit="editTransaction"
          @delete="deleteTransaction"
        />
      </div>
    </div>

    <!-- Модальное окно настройки баланса -->
    <div v-if="showBalanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Настроить баланс</h3>
            <Button 
              variant="ghost"
              size="sm"
              icon="lucide:x"
              @click="showBalanceModal = false"
            />
          </div>

          <form @submit.prevent="handleSaveBalance" class="space-y-4">
            <div>
              <label class="label">Текущий баланс</label>
              <div class="relative">
                <input 
                  v-model.number="balanceForm.currentBalance" 
                  type="number" 
                  step="0.01"
                  class="input-field pr-8"
                  placeholder="0"
                  required
                />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₽
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Укажите ваш реальный текущий баланс ({{ formatCurrency(stats.balance) }})
              </p>
            </div>

            <div class="flex space-x-3 pt-4">
              <Button 
                type="button"
                variant="secondary"
                size="md"
                @click="showBalanceModal = false"
                class="flex-1"
              >
                Отмена
              </Button>
              <Button 
                type="submit"
                variant="primary"
                size="md"
                class="flex-1"
              >
                Сохранить
              </Button>
            </div>
          </form>
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

import { useTransactionStore } from '~/stores/useTransactionStore'
import { useGoalStore } from '~/stores/useGoalStore'
import { useCategoryStore } from '~/stores/useCategoryStore'
import IncomeExpenseChart from '~/components/charts/IncomeExpenseChart.vue'

// Инициализация stores
const transactionStore = useTransactionStore()
const goalStore = useGoalStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

// Состояние для модального окна баланса
const showBalanceModal = ref(false)
const balanceForm = ref({
  currentBalance: 0
})

// Инициализация данных
onMounted(async () => {
  // Инициализируем аутентификацию
  authStore.initAuth()
  
  await categoryStore.getCategories()
  await transactionStore.getTransactions()
  await goalStore.getGoals()
})

// Получение статистики
const stats = computed(() => transactionStore.getStats())
const goalsStats = computed(() => goalStore.getGoalsStats())

// Получение последних транзакций
const recentTransactions = computed(() => {
  return transactionStore.transactions.slice(0, 5)
})

// Данные для графика
const chartData = computed(() => {
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    return date
  }).reverse()

  return {
    labels: last7Days.map(date => formatDate(date)),
    income: last7Days.map(date => {
      return transactionStore.transactions
        .filter(t => t.type === 'income' && isSameDay(new Date(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0)
    }),
    expenses: last7Days.map(date => {
      return transactionStore.transactions
        .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0)
    })
  }
})


// Утилиты форматирования
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date | string) => {
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'Неверная дата'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short'
  }).format(dateObj)
}

const formatDateFull = (date: Date | string) => {
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'Неверная дата'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj)
}

const formatDateTime = (date: Date | string) => {
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'Неверная дата'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

// Обработчики событий
const editTransaction = (transaction: any) => {
  // Переходим на страницу транзакций
  navigateTo('/transactions')
}

const deleteTransaction = async (transactionId: string) => {
  if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
    try {
      await transactionStore.deleteTransaction(transactionId)
    } catch (error) {
      console.error('Ошибка при удалении транзакции:', error)
    }
  }
}

// Обработка сохранения баланса
const handleSaveBalance = async () => {
  try {
    // Рассчитываем начальный баланс
    const currentBalance = balanceForm.value.currentBalance
    const transactionBalance = stats.value.balance - (authStore.user?.initialBalance || 0)
    const newInitialBalance = currentBalance - transactionBalance
    
    // Используем метод updateUser из auth store
    await authStore.updateUser({
      name: authStore.user?.name,
      email: authStore.user?.email,
      currency: authStore.user?.currency,
      initialBalance: newInitialBalance
    })
    
    showBalanceModal.value = false
  } catch (error) {
    console.error('Ошибка при сохранении баланса:', error)
  }
}

// Инициализация формы баланса
const initBalanceForm = () => {
  balanceForm.value.currentBalance = stats.value.balance
}

// Открытие модального окна
const openBalanceModal = () => {
  initBalanceForm()
  showBalanceModal.value = true
}
</script>
