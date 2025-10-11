<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Обновить прогресс</h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Информация о цели -->
        <div v-if="goal" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900">{{ goal.title }}</h4>
          <p class="text-sm text-gray-600 mt-1">{{ goal.description }}</p>
          
          <div class="mt-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Текущий прогресс</span>
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
                Осталось: {{ formatCurrency(goal.targetAmount - goal.currentAmount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Форма обновления прогресса -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Новая сумма -->
          <div>
            <label class="label">Новая сумма</label>
            <div class="relative">
              <input 
                v-model.number="newAmount" 
                type="number" 
                step="0.01"
                min="0"
                :max="goal?.targetAmount || 0"
                class="input-field pr-8"
                placeholder="0"
                required
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₽
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              Максимальная сумма: {{ formatCurrency(goal?.targetAmount || 0) }}
            </p>
          </div>

          <!-- Быстрые кнопки -->
          <div>
            <label class="label">Быстрые действия</label>
            <div class="grid grid-cols-2 gap-2">
              <Button 
                type="button"
                variant="secondary"
                size="sm"
                @click="setAmount(goal?.currentAmount || 0)"
              >
                Текущая сумма
              </Button>
              <Button 
                type="button"
                variant="primary"
                size="sm"
                @click="setAmount(goal?.targetAmount || 0)"
              >
                Полная сумма
              </Button>
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
              :disabled="!isValidAmount"
              class="flex-1"
            >
              Обновить
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Goal } from '~/types'

interface Props {
  goal: Goal | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [amount: number]
}>()

// Состояние
const newAmount = ref(0)

// Вычисляемые свойства
const isValidAmount = computed(() => {
  return newAmount.value >= 0 && 
         newAmount.value <= (props.goal?.targetAmount || 0)
})

// Методы
const setAmount = (amount: number) => {
  newAmount.value = amount
}

const handleSubmit = () => {
  if (isValidAmount.value) {
    emit('save', newAmount.value)
  }
}

// Инициализация
onMounted(() => {
  if (props.goal) {
    newAmount.value = props.goal.currentAmount
  }
})

// Сброс при изменении цели
watch(() => props.goal, (newGoal) => {
  if (newGoal) {
    newAmount.value = newGoal.currentAmount
  }
})

// Утилиты
const getProgressPercentage = (goal: Goal) => {
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}
</script>
