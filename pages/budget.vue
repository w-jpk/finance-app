<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Бюджет</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Управление лимитами трат по категориям</p>
      </div>
      <Button variant="primary" icon="lucide:plus" @click="showAddModal = true" class="w-full sm:w-auto">
        <span class="hidden sm:inline">Добавить бюджет</span>
        <span class="sm:hidden">Добавить</span>
      </Button>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Активных бюджетов</p>
            <p class="text-xl sm:text-2xl font-bold text-blue-600 truncate">{{ activeBudgets.length }}</p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:pie-chart" class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Общий бюджет</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {{ formatCurrency(totalBudget) }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:wallet" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Потрачено</p>
            <p class="text-xl sm:text-2xl font-bold text-red-600 truncate">
              {{ formatCurrency(totalSpent) }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:trending-down" class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Список бюджетов -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-gray-400 mx-auto animate-spin" />
        <p class="text-gray-500 mt-2">Загрузка...</p>
      </div>
      
      <div v-else-if="budgets.length === 0" class="text-center py-8">
        <Icon name="lucide:pie-chart" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Нет бюджетов</p>
        <p class="text-sm text-gray-400 mt-1">Создайте первый бюджет для контроля трат</p>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="budget in budgets" 
          :key="budget.id"
          class="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: budget.category?.color + '20' }"
              >
                <Icon 
                  :name="`lucide:${budget.category?.icon}`" 
                  class="w-5 h-5"
                  :style="{ color: budget.category?.color }"
                />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ budget.category?.name }}</h3>
                <p class="text-sm text-gray-600">
                  {{ budget.period === 'monthly' ? 'Ежемесячно' : 'Ежегодно' }}
                </p>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button 
                @click="editBudget(budget)"
                class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:edit" class="w-4 h-4" />
              </button>
              <button 
                @click="deleteBudget(budget.id)"
                class="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <!-- Прогресс бюджета -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Прогресс</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(getSpentAmount(budget)) }} / {{ formatCurrency(budget.amount) }}
              </span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300"
                :class="getBudgetStatus(budget) === 'over' ? 'bg-red-500' : 
                        getBudgetStatus(budget) === 'warning' ? 'bg-yellow-500' : 'bg-green-500'"
                :style="{ width: `${getBudgetPercentage(budget)}%` }"
              ></div>
            </div>
            
            <div class="flex items-center justify-between mt-2">
              <span 
                class="text-sm font-medium"
                :class="getBudgetStatus(budget) === 'over' ? 'text-red-600' : 
                        getBudgetStatus(budget) === 'warning' ? 'text-yellow-600' : 'text-green-600'"
              >
                {{ Math.round(getBudgetPercentage(budget)) }}% использовано
              </span>
              <span class="text-sm text-gray-500">
                Осталось: {{ formatCurrency(budget.amount - getSpentAmount(budget)) }}
              </span>
            </div>
          </div>
          
          <!-- Период -->
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>
              Период: {{ formatDate(budget.startDate) }} - {{ formatDate(budget.endDate) }}
            </span>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getBudgetStatus(budget) === 'over' ? 'bg-red-100 text-red-800' : 
                      getBudgetStatus(budget) === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
            >
              {{ getBudgetStatusText(budget) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <BudgetModal
      v-if="showAddModal || showEditModal"
      :budget="editingBudget"
      :categories="expenseCategories"
      @close="closeModal"
      @save="handleSaveBudget"
    />
  </div>
</template>

<script setup lang="ts">
// Защита страницы аутентификацией
definePageMeta({
  middleware: 'auth'
})
import { useBudgetStore } from '~/stores/useBudgetStore'
import { useCategoryStore } from '~/stores/useCategoryStore'
import { useTransactionStore } from '~/stores/useTransactionStore'
import BudgetModal from '~/components/BudgetModal.vue'
import type { Budget, BudgetForm } from '~/types'

// Stores
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

// Состояние
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingBudget = ref<Budget | null>(null)
const loading = ref(false)

// Получение данных
const budgets = computed(() => budgetStore.budgets)
const activeBudgets = computed(() => budgetStore.getActiveBudgets())
const expenseCategories = computed(() => categoryStore.categories.filter(c => c.type === 'expense'))

// Статистика
const totalBudget = computed(() => {
  return activeBudgets.value.reduce((sum, b) => sum + b.amount, 0)
})

const totalSpent = computed(() => {
  return activeBudgets.value.reduce((sum, b) => sum + getSpentAmount(b), 0)
})

// Методы
const getSpentAmount = (budget: Budget) => {
  const now = new Date()
  const startDate = new Date(budget.startDate)
  const endDate = new Date(budget.endDate)
  
  return transactionStore.transactions
    .filter(t => 
      t.type === 'expense' && 
      t.categoryId === budget.categoryId &&
      new Date(t.date) >= startDate &&
      new Date(t.date) <= endDate
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

const getBudgetPercentage = (budget: Budget) => {
  const spent = getSpentAmount(budget)
  return Math.min((spent / budget.amount) * 100, 100)
}

const getBudgetStatus = (budget: Budget) => {
  const percentage = getBudgetPercentage(budget)
  if (percentage >= 100) return 'over'
  if (percentage >= 80) return 'warning'
  return 'good'
}

const getBudgetStatusText = (budget: Budget) => {
  const status = getBudgetStatus(budget)
  const statusMap = {
    over: 'Превышен',
    warning: 'Почти превышен',
    good: 'В норме'
  }
  return statusMap[status]
}

const editBudget = (budget: Budget) => {
  editingBudget.value = budget
  showEditModal.value = true
}

const deleteBudget = async (id: string) => {
  if (confirm('Вы уверены, что хотите удалить этот бюджет?')) {
    try {
      await budgetStore.deleteBudget(id)
    } catch (error) {
      console.error('Ошибка при удалении бюджета:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingBudget.value = null
}

const handleSaveBudget = async (form: BudgetForm) => {
  try {
    if (editingBudget.value) {
      await budgetStore.updateBudget(editingBudget.value.id, form)
    } else {
      await budgetStore.addBudget(form)
    }
    closeModal()
  } catch (error) {
    console.error('Ошибка при сохранении бюджета:', error)
  }
}

// Утилиты
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
    month: 'short',
    year: 'numeric'
  }).format(dateObj)
}

// Инициализация
onMounted(async () => {
  // Инициализируем аутентификацию
  authStore.initAuth()
  
  await categoryStore.getCategories()
  await budgetStore.getBudgets()
})
</script>
