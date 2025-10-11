<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Транзакции</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Управление доходами и расходами</p>
      </div>
      <Button variant="primary" icon="lucide:plus" @click="showAddModal = true" class="w-full sm:w-auto">
        <span class="hidden sm:inline">Создать транзакцию</span>
        <span class="sm:hidden">Создать</span>
      </Button>
    </div>

    <!-- Табы -->
    <div class="card">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            @click="activeTab = 'expense'"
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center"
            :class="activeTab === 'expense' 
              ? 'border-red-500 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <Icon name="lucide:trending-down" class="w-4 h-4 inline mr-2 flex-shrink-0" />
            <span class="hidden sm:inline">Расходы</span>
            <span class="sm:hidden">Расходы</span>
            <span class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {{ expenseTransactions.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'income'"
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center"
            :class="activeTab === 'income' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <Icon name="lucide:trending-up" class="w-4 h-4 inline mr-2 flex-shrink-0" />
            <span class="hidden sm:inline">Доходы</span>
            <span class="sm:hidden">Доходы</span>
            <span class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {{ incomeTransactions.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Статистика для активного таба -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">
              {{ activeTab === 'income' ? 'Общий доход' : 'Общие расходы' }}
            </p>
            <p class="text-xl sm:text-2xl font-bold truncate" :class="activeTab === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(currentTabTotal) }}
            </p>
          </div>
          <div 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="activeTab === 'income' ? 'bg-green-100' : 'bg-red-100'"
          >
            <Icon 
              :name="activeTab === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'" 
              class="w-5 h-5 sm:w-6 sm:h-6"
              :class="activeTab === 'income' ? 'text-green-600' : 'text-red-600'"
            />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">За месяц</p>
            <p class="text-xl sm:text-2xl font-bold truncate" :class="activeTab === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(currentTabMonthly) }}
            </p>
          </div>
          <div 
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="activeTab === 'income' ? 'bg-green-100' : 'bg-red-100'"
          >
            <Icon name="lucide:calendar" class="w-5 h-5 sm:w-6 sm:h-6" :class="activeTab === 'income' ? 'text-green-600' : 'text-red-600'" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Количество</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {{ currentTabTransactions.length }}
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:receipt" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <label class="label">Категория</label>
          <select v-model="filters.categoryId" class="input-field">
            <option value="">Все категории</option>
            <option 
              v-for="category in currentTabCategories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="flex-1">
          <label class="label">Месяц</label>
          <select v-model="filters.selectedMonth" class="input-field">
            <option value="">Все месяцы</option>
            <option 
              v-for="month in availableMonths" 
              :key="month.value" 
              :value="month.value"
            >
              {{ month.label }}
            </option>
          </select>
        </div>
        
        <div class="flex items-end">
          <Button variant="secondary" icon="lucide:x" @click="clearFilters">
            Очистить
          </Button>
        </div>
      </div>
    </div>

    <!-- Список транзакций -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-gray-400 mx-auto animate-spin" />
        <p class="text-gray-500 mt-2">Загрузка...</p>
      </div>
      
      <div v-else-if="filteredTransactions.length === 0" class="text-center py-8">
        <Icon 
          :name="activeTab === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'" 
          class="w-12 h-12 text-gray-400 mx-auto mb-4" 
        />
        <p class="text-gray-500">
          {{ activeTab === 'income' ? 'Нет доходов' : 'Нет расходов' }}
        </p>
        <p class="text-sm text-gray-400 mt-1">
          {{ activeTab === 'income' ? 'Добавьте первый доход, чтобы начать учет' : 'Добавьте первый расход, чтобы начать учет' }}
        </p>
      </div>
      
      <div v-else class="space-y-4">
        <TransactionCard
          v-for="transaction in filteredTransactions" 
          :key="transaction.id"
          :transaction="transaction"
          :category="transaction.category"
          @edit="editTransaction"
          @delete="deleteTransaction"
        />
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <TransactionModal
      v-if="showAddModal || showEditModal"
      :transaction="editingTransaction"
      :categories="editingTransaction ? [...categoryStore.categories] : currentTabCategories"
      :transaction-type="editingTransaction ? null : null"
      @close="closeModal"
      @save="handleSaveTransaction"
    />
  </div>
</template>

<script setup lang="ts">
// Защита страницы аутентификацией
definePageMeta({
  middleware: 'auth'
})
import { useTransactionStore } from '~/stores/useTransactionStore'
import { useCategoryStore } from '~/stores/useCategoryStore'
import { useAuthStore } from '~/stores/useAuthStore'
import TransactionModal from '~/components/TransactionModal.vue'
import type { Transaction, TransactionForm, TransactionFilters } from '~/types'

// Stores
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

// Состояние
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const loading = ref(false)
const activeTab = ref<'income' | 'expense'>('expense') // По умолчанию расходы

// Фильтры
const filters = ref<TransactionFilters>({
  type: activeTab.value,
  categoryId: '',
  selectedMonth: ''
})

// Получение данных
const incomeTransactions = computed(() => transactionStore.transactions.filter(t => t.type === 'income'))
const expenseTransactions = computed(() => transactionStore.transactions.filter(t => t.type === 'expense'))
const incomeCategories = computed(() => categoryStore.categories.filter(c => c.type === 'income'))
const expenseCategories = computed(() => categoryStore.categories.filter(c => c.type === 'expense'))

// Текущий таб
const currentTabTransactions = computed(() => {
  return activeTab.value === 'income' ? incomeTransactions.value : expenseTransactions.value
})

const currentTabCategories = computed(() => {
  return activeTab.value === 'income' ? incomeCategories.value : expenseCategories.value
})

// Доступные месяцы с транзакциями
const availableMonths = computed(() => {
  return transactionStore.getAvailableMonths()
})

// Фильтрованные транзакции
const filteredTransactions = computed(() => {
  let filtered = [...currentTabTransactions.value]
  
  if (filters.value.categoryId) {
    filtered = filtered.filter(t => t.categoryId === filters.value.categoryId)
  }
  
  if (filters.value.selectedMonth) {
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date)
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`
      return transactionMonth === filters.value.selectedMonth
    })
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Статистика для текущего таба
const currentTabTotal = computed(() => {
  return currentTabTransactions.value.reduce((sum, t) => sum + t.amount, 0)
})

const currentTabMonthly = computed(() => {
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return currentTabTransactions.value
    .filter(t => new Date(t.date) >= currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)
})

// Методы
const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction
  showEditModal.value = true
}

const deleteTransaction = async (id: string) => {
  const transactionType = transactionStore.transactions.find(t => t.id === id)?.type
  const typeText = transactionType === 'income' ? 'доход' : 'расход'
  
  if (confirm(`Вы уверены, что хотите удалить этот ${typeText}?`)) {
    try {
      await transactionStore.deleteTransaction(id)
    } catch (error) {
      console.error(`Ошибка при удалении ${typeText}:`, error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingTransaction.value = null
}

const handleSaveTransaction = async (form: TransactionForm) => {
  try {
    if (editingTransaction.value) {
      await transactionStore.updateTransaction(editingTransaction.value.id, form)
    } else {
      await transactionStore.addTransaction(form)
    }
    closeModal()
  } catch (error) {
    console.error('Ошибка при сохранении транзакции:', error)
  }
}

const clearFilters = () => {
  filters.value = {
    type: activeTab.value,
    categoryId: '',
    selectedMonth: ''
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

// Обновление фильтров при смене таба
watch(activeTab, (newTab) => {
  filters.value.type = newTab
  filters.value.categoryId = '' // Сбрасываем фильтр категории при смене таба
  filters.value.selectedMonth = '' // Сбрасываем фильтр месяца при смене таба
})

// Инициализация
onMounted(async () => {
  const authStore = useAuthStore()
  await authStore.initAuth()
  await categoryStore.initCategories()
  await categoryStore.getCategories()
  await transactionStore.getTransactions()
})
</script>
