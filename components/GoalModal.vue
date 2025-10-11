<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Редактировать цель' : 'Создать цель' }}
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
          <!-- Название -->
          <div>
            <label class="label">Название цели</label>
            <input 
              v-model="form.title" 
              type="text" 
              class="input-field"
              placeholder="Введите название цели"
              required
            />
          </div>

          <!-- Описание -->
          <div>
            <label class="label">Описание</label>
            <textarea 
              v-model="form.description" 
              class="input-field"
              rows="3"
              placeholder="Опишите вашу цель"
            ></textarea>
          </div>

          <!-- Целевая сумма -->
          <div>
            <label class="label">Целевая сумма</label>
            <div class="relative">
              <input 
                v-model.number="form.targetAmount" 
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

          <!-- Текущая сумма (только для редактирования) -->
          <div v-if="isEditing">
            <label class="label">Текущая сумма</label>
            <div class="relative">
              <input 
                v-model.number="currentAmount" 
                type="number" 
                step="0.01"
                min="0"
                class="input-field pr-8"
                placeholder="0"
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₽
              </span>
            </div>
          </div>

          <!-- Целевая дата -->
          <div>
            <label class="label">Целевая дата</label>
            <input 
              v-model="form.targetDate" 
              type="date" 
              class="input-field"
              required
            />
          </div>

          <!-- Категория -->
          <div>
            <label class="label">Категория (необязательно)</label>
            <select v-model="form.categoryId" class="input-field">
              <option value="">Без категории</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
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
              {{ isEditing ? 'Сохранить' : 'Создать' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Goal, GoalForm, Category } from '~/types'

interface Props {
  goal?: Goal | null
  categories: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [form: GoalForm]
}>()

// Состояние формы
const form = ref<GoalForm>({
  title: '',
  description: '',
  targetAmount: 0,
  targetDate: '',
  categoryId: ''
})

const currentAmount = ref(0)

// Вычисляемые свойства
const isEditing = computed(() => !!props.goal)

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' && 
         form.value.targetAmount > 0 && 
         form.value.targetDate !== ''
})

// Инициализация формы
const initForm = () => {
  if (props.goal) {
    form.value = {
      title: props.goal.title,
      description: props.goal.description,
      targetAmount: props.goal.targetAmount,
      targetDate: new Date(props.goal.targetDate).toISOString().split('T')[0],
      categoryId: props.goal.categoryId || ''
    }
    currentAmount.value = props.goal.currentAmount
  } else {
    form.value = {
      title: '',
      description: '',
      targetAmount: 0,
      targetDate: '',
      categoryId: ''
    }
    currentAmount.value = 0
  }
}

// Обработка отправки формы
const handleSubmit = () => {
  if (isFormValid.value) {
    emit('save', { ...form.value })
  }
}

// Инициализация при монтировании
onMounted(() => {
  initForm()
})

// Инициализация при изменении пропсов
watch(() => props.goal, () => {
  initForm()
}, { immediate: true })
</script>
