<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Редактировать бюджет' : 'Добавить бюджет' }}
          </h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Форма -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Категория -->
          <div>
            <label class="label">Категория</label>
            <select v-model="form.categoryId" class="input-field" required>
              <option value="">Выберите категорию</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Сумма -->
          <div>
            <label class="label">Сумма бюджета</label>
            <div class="relative">
              <input 
                v-model.number="form.amount" 
                type="number" 
                step="0.01"
                min="0"
                class="input-field pr-8"
                placeholder="0"
                required
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₽
              </span>
            </div>
          </div>

          <!-- Период -->
          <div>
            <label class="label">Период</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  v-model="form.period" 
                  type="radio" 
                  value="monthly"
                  class="mr-2"
                />
                <span class="text-sm font-medium text-gray-700">Ежемесячно</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="form.period" 
                  type="radio" 
                  value="yearly"
                  class="mr-2"
                />
                <span class="text-sm font-medium text-gray-700">Ежегодно</span>
              </label>
            </div>
          </div>

          <!-- Даты -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Дата начала</label>
              <input 
                v-model="form.startDate" 
                type="date" 
                class="input-field"
                required
              />
            </div>
            
            <div>
              <label class="label">Дата окончания</label>
              <input 
                v-model="form.endDate" 
                type="date" 
                class="input-field"
                required
              />
            </div>
          </div>

          <!-- Предварительный просмотр -->
          <div v-if="selectedCategory" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: selectedCategory.color + '20' }"
              >
                <Icon 
                  :name="`lucide:${selectedCategory.icon}`" 
                  class="w-5 h-5"
                  :style="{ color: selectedCategory.color }"
                />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ selectedCategory.name }}</p>
                <p class="text-sm text-gray-600">
                  Бюджет: {{ formatCurrency(form.amount) }} 
                  ({{ form.period === 'monthly' ? 'в месяц' : 'в год' }})
                </p>
              </div>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="flex space-x-3 pt-4">
            <Button 
              type="button"
              variant="secondary"
              size="md"
              @click="$emit('close')"
              class="flex-1"
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              variant="primary"
              size="md"
              :disabled="!isFormValid"
              class="flex-1"
            >
              {{ isEditing ? 'Сохранить' : 'Добавить' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Budget, BudgetForm, Category } from '~/types'

interface Props {
  budget?: Budget | null
  categories: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [form: BudgetForm]
}>()

// Состояние формы
const form = ref<BudgetForm>({
  categoryId: '',
  amount: 0,
  period: 'monthly',
  startDate: '',
  endDate: ''
})

// Вычисляемые свойства
const isEditing = computed(() => !!props.budget)

const selectedCategory = computed(() => {
  return props.categories.find(c => c.id === form.value.categoryId)
})

const isFormValid = computed(() => {
  return form.value.categoryId !== '' && 
         form.value.amount > 0 && 
         form.value.startDate !== '' && 
         form.value.endDate !== ''
})

// Инициализация формы
const initForm = () => {
  if (props.budget) {
    form.value = {
      categoryId: props.budget.categoryId,
      amount: props.budget.amount,
      period: props.budget.period,
      startDate: new Date(props.budget.startDate).toISOString().split('T')[0],
      endDate: new Date(props.budget.endDate).toISOString().split('T')[0]
    }
  } else {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    form.value = {
      categoryId: '',
      amount: 0,
      period: 'monthly',
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    }
  }
}

// Обработка отправки формы
const handleSubmit = () => {
  if (isFormValid.value) {
    emit('save', { ...form.value })
  }
}

// Автоматическое обновление дат при изменении периода
watch(() => form.value.period, (newPeriod) => {
  const now = new Date()
  
  if (newPeriod === 'monthly') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    form.value.startDate = startOfMonth.toISOString().split('T')[0]
    form.value.endDate = endOfMonth.toISOString().split('T')[0]
  } else if (newPeriod === 'yearly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const endOfYear = new Date(now.getFullYear(), 11, 31)
    form.value.startDate = startOfYear.toISOString().split('T')[0]
    form.value.endDate = endOfYear.toISOString().split('T')[0]
  }
})

// Утилиты
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

// Инициализация при монтировании
onMounted(() => {
  initForm()
})

// Инициализация при изменении пропсов
watch(() => props.budget, () => {
  initForm()
}, { immediate: true })
</script>
