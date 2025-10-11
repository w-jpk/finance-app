<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Финансовые цели</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Планируйте и отслеживайте достижение целей</p>
      </div>
      <Button variant="primary" icon="lucide:plus" @click="showAddModal = true" class="w-full sm:w-auto">
        <span class="hidden sm:inline">Создать цель</span>
        <span class="sm:hidden">Создать</span>
      </Button>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Всего целей</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">{{ goalsStats.total }}</p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:target" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Выполнено</p>
            <p class="text-xl sm:text-2xl font-bold text-green-600 truncate">{{ goalsStats.completed }}</p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:check-circle" class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">В процессе</p>
            <p class="text-xl sm:text-2xl font-bold text-blue-600 truncate">{{ goalsStats.active }}</p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:clock" class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-600">Прогресс</p>
            <p class="text-xl sm:text-2xl font-bold text-purple-600 truncate">{{ Math.round(goalsStats.completionRate) }}%</p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:trending-up" class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <label class="label">Статус</label>
          <select v-model="statusFilter" class="input-field">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="completed">Выполненные</option>
            <option value="paused">Приостановленные</option>
          </select>
        </div>
        
        <div class="flex-1">
          <label class="label">Категория</label>
          <select v-model="categoryFilter" class="input-field">
            <option value="">Все категории</option>
            <option 
              v-for="category in allCategories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
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

    <!-- Список целей -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-gray-400 mx-auto animate-spin" />
        <p class="text-gray-500 mt-2">Загрузка...</p>
      </div>
      
      <div v-else-if="filteredGoals.length === 0" class="text-center py-8">
        <Icon name="lucide:target" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Нет целей</p>
        <p class="text-sm text-gray-400 mt-1">Создайте первую цель, чтобы начать планирование</p>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="goal in filteredGoals" 
          :key="goal.id"
          class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-5">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h3 class="text-xl font-semibold text-gray-900">{{ goal.title }}</h3>
                <span 
                  class="px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': goal.status === 'completed',
                    'bg-blue-100 text-blue-800': goal.status === 'active',
                    'bg-yellow-100 text-yellow-800': goal.status === 'paused'
                  }"
                >
                  {{ getStatusText(goal.status) }}
                </span>
              </div>
              <p class="text-gray-600 mt-2" v-if="goal.description">{{ goal.description }}</p>
            </div>

            <div class="flex items-center space-x-1 ml-4">
              <button 
                @click="editGoal(goal)"
                class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:edit" class="w-4 h-4" />
              </button>
              <button 
                @click="deleteGoal(goal.id)"
                class="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Верхняя сводка -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div class="text-xs text-gray-500">Осталось накопить</div>
              <div class="mt-1 text-base font-semibold text-gray-900">
                {{ formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0)) }}
              </div>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div class="text-xs text-gray-500">До дедлайна</div>
              <div class="mt-1 text-base font-semibold text-gray-900">
                {{ getRemainingTimeText(goal.targetDate) }}
              </div>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div class="text-xs text-gray-500">Ежемесячно к цели</div>
              <div class="mt-1 text-base font-semibold" :class="monthlyAmount(goal).isFeasible ? 'text-gray-900' : 'text-red-600'">
                {{ formatCurrency(monthlyAmount(goal).amount) }}
              </div>
            </div>
          </div>

          <!-- Прогресс -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Прогресс</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(goal.currentAmount) }} / {{ formatCurrency(goal.targetAmount) }}
              </span>
            </div>
            
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${getProgressPercentage(goal)}%` }"
              ></div>
            </div>
            
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm text-gray-500">
                {{ Math.round(getProgressPercentage(goal)) }}% выполнено
              </span>
              <span class="text-sm text-gray-500">
                Цель до: {{ formatDate(goal.targetDate) }}
              </span>
            </div>
          </div>

          <!-- Нижняя панель действий -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span v-if="goal.category" class="text-sm text-gray-500">
                Категория: {{ goal.category.name }}
              </span>
            </div>
            
            <div class="flex space-x-2">
              <Button 
                variant="secondary"
                size="sm"
                icon="lucide:plus"
                @click="updateProgress(goal)"
                :disabled="goal.status === 'completed'"
              >
                Обновить прогресс
              </Button>
              
              <Button 
                :variant="goal.status === 'active' ? 'danger' : 'success'"
                size="sm"
                :icon="goal.status === 'active' ? 'lucide:pause' : 'lucide:play'"
                @click="toggleStatus(goal)"
              >
                {{ goal.status === 'active' ? 'Приостановить' : 'Возобновить' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <GoalModal
      v-if="showAddModal || showEditModal"
      :goal="editingGoal"
      :categories="allCategories"
      @close="closeModal"
      @save="handleSaveGoal"
    />

    <!-- Модальное окно обновления прогресса -->
    <ProgressModal
      v-if="showProgressModal"
      :goal="selectedGoal"
      @close="closeProgressModal"
      @save="handleUpdateProgress"
    />
  </div>
</template>

<script setup lang="ts">
// Защита страницы аутентификацией
definePageMeta({
  middleware: 'auth'
})
import { useGoalStore } from '~/stores/useGoalStore'
import { useCategoryStore } from '~/stores/useCategoryStore'
import GoalModal from '~/components/GoalModal.vue'
import ProgressModal from '~/components/ProgressModal.vue'
import type { Goal, GoalForm } from '~/types'

// Stores
const goalStore = useGoalStore()
const categoryStore = useCategoryStore()

// Состояние
const showAddModal = ref(false)
const showEditModal = ref(false)
const showProgressModal = ref(false)
const editingGoal = ref<Goal | null>(null)
const selectedGoal = ref<Goal | null>(null)
const loading = ref(false)

// Фильтры
const statusFilter = ref('')
const categoryFilter = ref('')

// Получение данных
const allGoals = computed(() => goalStore.goals)
const allCategories = computed(() => categoryStore.categories)
const goalsStats = computed(() => goalStore.getGoalsStats())

// Фильтрованные цели
const filteredGoals = computed(() => {
  let filtered = [...allGoals.value]
  
  if (statusFilter.value) {
    filtered = filtered.filter(g => g.status === statusFilter.value)
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(g => g.categoryId === categoryFilter.value)
  }
  
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Методы
const editGoal = (goal: Goal) => {
  editingGoal.value = goal
  showEditModal.value = true
}

const deleteGoal = async (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту цель?')) {
    try {
      await goalStore.deleteGoal(id)
    } catch (error) {
      console.error('Ошибка при удалении цели:', error)
    }
  }
}

const updateProgress = (goal: Goal) => {
  selectedGoal.value = goal
  showProgressModal.value = true
}

const toggleStatus = async (goal: Goal) => {
  const newStatus = goal.status === 'active' ? 'paused' : 'active'
  try {
    await goalStore.updateGoalStatus(goal.id, newStatus)
  } catch (error) {
    console.error('Ошибка при изменении статуса цели:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingGoal.value = null
}

const closeProgressModal = () => {
  showProgressModal.value = false
  selectedGoal.value = null
}

const handleSaveGoal = async (form: GoalForm) => {
  try {
    if (editingGoal.value) {
      await goalStore.updateGoal(editingGoal.value.id, form)
    } else {
      await goalStore.addGoal(form)
    }
    closeModal()
  } catch (error) {
    console.error('Ошибка при сохранении цели:', error)
  }
}

const handleUpdateProgress = async (amount: number) => {
  if (selectedGoal.value) {
    try {
      await goalStore.updateGoalProgress(selectedGoal.value.id, amount)
      closeProgressModal()
    } catch (error) {
      console.error('Ошибка при обновлении прогресса:', error)
    }
  }
}

const clearFilters = () => {
  statusFilter.value = ''
  categoryFilter.value = ''
}

// Утилиты
const getProgressPercentage = (goal: Goal) => {
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
}

const getStatusText = (status: string) => {
  const statusMap = {
    active: 'Активная',
    completed: 'Выполнена',
    paused: 'Приостановлена'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

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

// Осталось времени в человеко-читаемом виде
const getRemainingTimeText = (targetDate: Date | string) => {
  const now = new Date()
  const target = new Date(targetDate)
  if (isNaN(target.getTime())) return 'Неверная дата'
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return 'срок истек'

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (days < 31) return `${days} дн.`
  const months = Math.floor(days / 30)
  const remDays = days - months * 30
  if (remDays < 3) return `${months} мес.`
  return `${months} мес. ${remDays} дн.`
}

// Расчет требуемого ежемесячного взноса до конца периода
const monthlyAmount = (goal: Goal) => {
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
  const now = new Date()
  const target = new Date(goal.targetDate)
  if (isNaN(target.getTime())) return { amount: 0, isFeasible: true }

  // Если срок уже прошел
  if (target.getTime() <= now.getTime()) {
    return { amount: remaining, isFeasible: remaining === 0 }
  }

  // Количество оставшихся месяцев (минимум 1)
  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const months = Math.max(1, Math.ceil(days / 30))
  const perMonth = remaining / months
  return { amount: perMonth, isFeasible: true }
}

// Инициализация
onMounted(async () => {
  const authStore = useAuthStore()
  await authStore.initAuth()
  await categoryStore.initCategories()
  await categoryStore.getCategories()
  await goalStore.getGoals()
})
</script>
