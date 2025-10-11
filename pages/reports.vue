<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Отчеты и статистика</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">Анализ ваших финансов</p>
    </div>

    <!-- Фильтры -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <label class="label">Период</label>
          <select v-model="filters.period" class="input-field">
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </select>
        </div>
        
        <div class="flex-1" v-if="filters.period === 'month'">
          <label class="label">Месяц</label>
          <select v-model="filters.selectedMonth" class="input-field">
            <option 
              v-for="option in monthOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="flex-1" v-if="filters.period === 'quarter'">
          <label class="label">Квартал</label>
          <select v-model="filters.selectedQuarter" class="input-field">
            <option 
              v-for="option in quarterOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="flex-1" v-if="filters.period === 'year'">
          <label class="label">Год</label>
          <select v-model="filters.selectedYear" class="input-field">
            <option 
              v-for="option in yearOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="flex-1">
          <label class="label">Категория</label>
          <select v-model="filters.categoryId" class="input-field">
            <option value="">Все категории</option>
            <option 
              v-for="category in allCategories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }} ({{ category.type === 'income' ? 'доход' : 'расход' }})
            </option>
          </select>
        </div>
        
        <div class="flex items-end">
          <Button variant="primary" icon="lucide:refresh-cw" @click="generateReport">
            Обновить
          </Button>
        </div>
      </div>
    </div>

    <!-- Общая статистика -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Общий доход</p>
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(reportData.totalIncome) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:trending-up" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Общие расходы</p>
            <p class="text-2xl font-bold text-red-600">
              {{ formatCurrency(reportData.totalExpenses) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:trending-down" class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Баланс</p>
            <p 
              class="text-2xl font-bold"
              :class="reportData.balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(reportData.balance) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:wallet" class="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Графики -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- График доходов и расходов по времени -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Доходы и расходы по времени</h3>
        </div>
        <div class="h-64">
          <IncomeExpenseChart :data="chartData" />
        </div>
      </div>

      <!-- График расходов по категориям -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Расходы по категориям</h3>
        </div>
        <div class="h-64">
          <ExpenseCategoryChart :data="categoryData" />
        </div>
      </div>
    </div>

    <!-- Детальная статистика по категориям -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Детальная статистика</h3>
      </div>
      
      <div v-if="reportData.categories.length === 0" class="text-center py-8">
        <Icon name="lucide:bar-chart-3" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Нет данных для отображения</p>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="category in reportData.categories" 
          :key="category.categoryId"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: getCategoryColor(category.categoryId) + '20' }"
            >
              <Icon 
                :name="`lucide:${getCategoryIcon(category.categoryId)}`" 
                class="w-5 h-5"
                :style="{ color: getCategoryColor(category.categoryId) }"
              />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ category.categoryName }}</p>
              <p class="text-sm text-gray-600">{{ category.percentage.toFixed(1) }}% от общих расходов</p>
            </div>
          </div>
          
          <div class="text-right">
            <p class="font-semibold text-gray-900">
              {{ formatCurrency(category.amount) }}
            </p>
            <div class="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                class="bg-primary-600 h-2 rounded-full"
                :style="{ width: `${category.percentage}%` }"
              ></div>
            </div>
          </div>
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
import { useCategoryStore } from '~/stores/useCategoryStore'
import IncomeExpenseChart from '~/components/charts/IncomeExpenseChart.vue'
import ExpenseCategoryChart from '~/components/charts/ExpenseCategoryChart.vue'
import type { ReportFilters, Report } from '~/types'

// Stores
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const allCategories = computed(() => categoryStore.categories)

// Автоматическая генерация опций для фильтров
const monthOptions = computed(() => {
  const options = [{ value: '', label: 'Выберите месяц' }]
  
  // Получаем уникальные месяцы с транзакциями
  const monthSet = new Set<string>()
  
  transactionStore.transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthSet.add(monthStr)
  })
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  
  // Сортируем месяцы по убыванию (новые сначала)
  const sortedMonths = Array.from(monthSet).sort().reverse()
  
  sortedMonths.forEach(monthStr => {
    const [year, month] = monthStr.split('-')
    const monthIndex = parseInt(month) - 1
    options.push({
      value: monthStr,
      label: `${monthNames[monthIndex]} ${year}`
    })
  })
  
  return options
})

const quarterOptions = computed(() => {
  const options = [{ value: '', label: 'Выберите квартал' }]
  
  // Получаем уникальные кварталы с транзакциями
  const quarterSet = new Set<string>()
  
  transactionStore.transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // 1-12
    const quarter = Math.ceil(month / 3) // 1-4
    const quarterStr = `${year}-Q${quarter}`
    quarterSet.add(quarterStr)
  })
  
  // Сортируем кварталы по убыванию (новые сначала)
  const sortedQuarters = Array.from(quarterSet).sort().reverse()
  
  sortedQuarters.forEach(quarterStr => {
    const [year, quarter] = quarterStr.split('-Q')
    const quarterNum = parseInt(quarter)
    const quarterLabels = [
      `Q1 ${year} (Янв-Мар)`,
      `Q2 ${year} (Апр-Июн)`,
      `Q3 ${year} (Июл-Сен)`,
      `Q4 ${year} (Окт-Дек)`
    ]
    
    options.push({
      value: quarterStr,
      label: quarterLabels[quarterNum - 1]
    })
  })
  
  return options
})

const yearOptions = computed(() => {
  const options = [{ value: '', label: 'Выберите год' }]
  
  // Получаем уникальные годы с транзакциями
  const yearSet = new Set<string>()
  
  transactionStore.transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const year = date.getFullYear().toString()
    yearSet.add(year)
  })
  
  // Сортируем годы по убыванию (новые сначала)
  const sortedYears = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a))
  
  sortedYears.forEach(year => {
    options.push({
      value: year,
      label: year
    })
  })
  
  return options
})

// Фильтры
const filters = ref<ReportFilters>({
  period: 'month',
  selectedMonth: '',
  selectedQuarter: '',
  selectedYear: '',
  categoryId: ''
})

// Данные отчета
const reportData = ref<Report>({
  period: '',
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  categories: []
})

// Данные для графиков (по выбранному периоду)
const chartData = computed(() => {
  let start: Date, end: Date
  
  if (filters.value.period === 'month' && filters.value.selectedMonth) {
    start = parseMonthDate(filters.value.selectedMonth)
    end = parseMonthDate(filters.value.selectedMonth, true)
  } else if (filters.value.period === 'quarter') {
    const now = new Date()
    start = startOfQuarter(now)
    end = endOfQuarter(now)
  } else if (filters.value.period === 'year') {
    const now = new Date()
    start = startOfYear(now)
    end = endOfYear(now)
  } else {
    // По умолчанию текущий месяц
    const now = new Date()
    start = startOfMonth(now)
    end = endOfMonth(now)
  }
  
  const dates = enumerateDates(start, end)

  return {
    labels: dates.map(date => formatDate(date)),
    income: dates.map(date => {
      return transactionStore.transactions
        .filter(t => t.type === 'income' && isSameDay(new Date(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0)
    }),
    expenses: dates.map(date => {
      return transactionStore.transactions
        .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), date))
        .reduce((sum, t) => sum + t.amount, 0)
    })
  }
})

const categoryData = computed(() => {
  const expenseCategories = categoryStore.categories.filter(c => c.type === 'expense')
  let start: Date, end: Date
  
  if (filters.value.period === 'month' && filters.value.selectedMonth) {
    start = parseMonthDate(filters.value.selectedMonth)
    end = parseMonthDate(filters.value.selectedMonth, true)
  } else if (filters.value.period === 'quarter') {
    const now = new Date()
    start = startOfQuarter(now)
    end = endOfQuarter(now)
  } else if (filters.value.period === 'year') {
    const now = new Date()
    start = startOfYear(now)
    end = endOfYear(now)
  } else {
    // По умолчанию текущий месяц
    const now = new Date()
    start = startOfMonth(now)
    end = endOfMonth(now)
  }
  
  return {
    labels: expenseCategories.map(c => `${c.name}`),
    data: expenseCategories.map(category => {
      return transactionStore.transactions
        .filter(t => t.type === 'expense' && t.categoryId === category.id)
        .filter(t => new Date(t.date) >= start && new Date(t.date) <= end)
        .reduce((sum, t) => sum + t.amount, 0)
    }),
    colors: expenseCategories.map(c => c.color)
  }
})

// Методы
const generateReport = () => {
  const transactions = transactionStore.transactions
  let filtered = [...transactions]
  
  // Фильтрация по периоду
  let startDate: Date, endDate: Date
  
  if (filters.value.period === 'month' && filters.value.selectedMonth) {
    startDate = parseMonthDate(filters.value.selectedMonth)
    endDate = parseMonthDate(filters.value.selectedMonth, true)
  } else if (filters.value.period === 'quarter') {
    const now = new Date()
    startDate = startOfQuarter(now)
    endDate = endOfQuarter(now)
  } else if (filters.value.period === 'year') {
    const now = new Date()
    startDate = startOfYear(now)
    endDate = endOfYear(now)
  } else {
    // По умолчанию текущий месяц
    const now = new Date()
    startDate = startOfMonth(now)
    endDate = endOfMonth(now)
  }
  
  filtered = filtered.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= startDate && transactionDate <= endDate
  })
  
  // Фильтрация по категории
  if (filters.value.categoryId) {
    filtered = filtered.filter(t => t.categoryId === filters.value.categoryId)
  }
  
  // Расчет статистики
  const incomeTransactions = filtered.filter(t => t.type === 'income')
  const expenseTransactions = filtered.filter(t => t.type === 'expense')
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  
  // Группировка расходов по категориям
  const categoryMap = new Map()
  expenseTransactions.forEach(transaction => {
    const category = categoryStore.categories.find(c => c.id === transaction.categoryId)
    if (category) {
      const existing = categoryMap.get(category.id) || { categoryId: category.id, categoryName: category.name, amount: 0 }
      existing.amount += transaction.amount
      categoryMap.set(category.id, existing)
    }
  })
  
  const categories = Array.from(categoryMap.values())
    .map(cat => ({
      ...cat,
      percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
  
  const periodName = filters.value.period === 'month' && filters.value.selectedMonth 
    ? getMonthName(filters.value.selectedMonth)
    : filters.value.period === 'quarter' 
    ? 'текущий квартал'
    : filters.value.period === 'year'
    ? 'текущий год'
    : 'текущий месяц'
  
  reportData.value = {
    period: periodName,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    categories
  }
}

const getCategoryColor = (categoryId: string) => {
  const category = categoryStore.categories.find(c => c.id === categoryId)
  return category?.color || '#6b7280'
}

const getCategoryIcon = (categoryId: string) => {
  const category = categoryStore.categories.find(c => c.id === categoryId)
  return category?.icon || 'tag'
}

const getMonthName = (monthStr: string) => {
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  
  const match = monthStr.match(/^(\d{4})-(\d{2})$/)
  if (match) {
    const year = match[1]
    const month = Number(match[2]) - 1
    return `${monthNames[month]} ${year}`
  }
  return monthStr
}


// Утилиты
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date) => {
  if (isNaN(date.getTime())) {
    return 'Неверная дата'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

// Вспомогательные функции дат
const parseISODate = (dateStr?: string) => {
  if (!dateStr) return new Date()
  // Разбираем YYYY-MM-DD как локальную дату, чтобы избежать сдвига по UTC
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    return new Date(year, month, day)
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

const parseMonthDate = (monthStr?: string, isEndOfMonth = false) => {
  if (!monthStr) return new Date()
  // Разбираем YYYY-MM как локальную дату
  const match = monthStr.match(/^(\d{4})-(\d{2})$/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    if (isEndOfMonth) {
      // Возвращаем последний день месяца
      return new Date(year, month + 1, 0, 23, 59, 59, 999)
    } else {
      // Возвращаем первый день месяца
      return new Date(year, month, 1)
    }
  }
  return new Date()
}

const parseQuarterDate = (quarterStr?: string, isEndOfQuarter = false) => {
  if (!quarterStr) return new Date()
  // Разбираем YYYY-QX
  const match = quarterStr.match(/^(\d{4})-Q(\d)$/)
  if (match) {
    const year = Number(match[1])
    const quarter = Number(match[2])
    const startMonth = (quarter - 1) * 3 // Q1=0, Q2=3, Q3=6, Q4=9
    
    if (isEndOfQuarter) {
      // Возвращаем последний день квартала
      return new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
    } else {
      // Возвращаем первый день квартала
      return new Date(year, startMonth, 1)
    }
  }
  return new Date()
}

const parseYearDate = (yearStr?: string, isEndOfYear = false) => {
  if (!yearStr) return new Date()
  const year = Number(yearStr)
  if (isEndOfYear) {
    // Возвращаем последний день года
    return new Date(year, 11, 31, 23, 59, 59, 999)
  } else {
    // Возвращаем первый день года
    return new Date(year, 0, 1)
  }
}


const toMonthISO = (date: Date) => formatMonthISO(date)

const formatMonthISO = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)
const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1)
const endOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31)
const startOfQuarter = (date: Date) => {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3
  return new Date(date.getFullYear(), quarterStartMonth, 1)
}
const endOfQuarter = (date: Date) => {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3
  return new Date(date.getFullYear(), quarterStartMonth + 3, 0)
}

const enumerateDates = (start: Date, end: Date) => {
  const dates: Date[] = []
  const d = new Date(start)
  d.setHours(0,0,0,0)
  const last = new Date(end)
  last.setHours(0,0,0,0)
  while (d.getTime() <= last.getTime()) {
    dates.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}


// Автоматическое обновление отчета при изменении фильтров
watch(() => [filters.value.period, filters.value.selectedMonth, filters.value.selectedQuarter, filters.value.selectedYear, filters.value.categoryId], () => {
  generateReport()
}, { deep: true })

// Инициализация
onMounted(async () => {
  await categoryStore.getCategories()
  await transactionStore.getTransactions()
  
  // Устанавливаем первый доступный месяц по умолчанию, если есть транзакции
  const availableMonths = monthOptions.value.filter(option => option.value !== '')
  if (availableMonths.length > 0) {
    filters.value.selectedMonth = availableMonths[0].value
  }
  
  generateReport()
})
</script>
