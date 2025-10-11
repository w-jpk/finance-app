<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Редактировать категорию' : 'Добавить категорию' }}
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
            <label class="label">Название категории</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="input-field"
              placeholder="Введите название категории"
              required
            />
          </div>

          <!-- Тип -->
          <div>
            <label class="label">Тип</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  v-model="form.type" 
                  type="radio" 
                  value="income"
                  class="mr-2"
                />
                <span class="text-sm font-medium text-green-600">Доход</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="form.type" 
                  type="radio" 
                  value="expense"
                  class="mr-2"
                />
                <span class="text-sm font-medium text-red-600">Расход</span>
              </label>
            </div>
          </div>

          <!-- Цвет -->
          <div>
            <label class="label">Цвет</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                @click="form.color = color"
                class="w-10 h-10 rounded-lg border-2 transition-all"
                :class="form.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
                :style="{ backgroundColor: color }"
              >
                <Icon 
                  v-if="form.color === color"
                  name="lucide:check" 
                  class="w-5 h-5 text-white mx-auto"
                />
              </button>
            </div>
          </div>

          <!-- Иконка -->
          <div>
            <label class="label">Иконка</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                type="button"
                @click="form.icon = icon"
                class="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all"
                :class="form.icon === icon ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <Icon :name="`lucide:${icon}`" class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Предварительный просмотр -->
          <div>
            <label class="label">Предварительный просмотр</label>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :style="{ backgroundColor: form.color }"
                >
                  <Icon 
                    :name="`lucide:${form.icon}`" 
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ form.name || 'Название категории' }}</p>
                  <p class="text-sm text-gray-600">
                    {{ form.type === 'income' ? 'Доход' : 'Расход' }}
                  </p>
                </div>
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
import type { Category, CategoryForm } from '~/types'

interface Props {
  category?: Category | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [form: CategoryForm]
}>()

// Состояние формы
const form = ref<CategoryForm>({
  name: '',
  type: 'income',
  color: '#22c55e',
  icon: 'tag'
})

// Опции для выбора
const colorOptions = [
  // Основные цвета (ваши оригинальные)
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // violet
  
  // Дополнительные насыщенные цвета
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#d97706', // amber-600
  '#ca8a04', // yellow-600
  '#65a30d', // lime-600
  '#16a34a', // green-600
  '#059669', // emerald-600
  '#0d9488', // teal-600
  '#0891b2', // cyan-600
  '#0284c7', // blue-600
  '#2563eb', // blue-700
  '#4f46e5', // indigo-600
  '#7c3aed', // purple-600
  '#9333ea', // violet-600
  '#c026d3', // fuchsia-600
  '#db2777', // pink-600
  
  // Пастельные цвета
  '#fecaca', // red-200
  '#fed7aa', // orange-200
  '#fde68a', // amber-200
  '#fef08a', // yellow-200
  '#d9f99d', // lime-200
  '#bbf7d0', // green-200
  '#a7f3d0', // emerald-200
  '#99f6e4', // teal-200
  '#a5f3fc', // cyan-200
  '#bae6fd', // blue-200
  '#c7d2fe', // indigo-200
  '#ddd6fe', // purple-200
  '#e9d5ff', // violet-200
  '#f5d0fe', // fuchsia-200
  '#fbcfe8', // pink-200
  
  // Темные/глубокие цвета
  '#991b1b', // red-800
  '#9a3412', // orange-800
  '#92400e', // amber-800
  '#854d0e', // yellow-800
  '#3f6212', // lime-800
  '#166534', // green-800
  '#065f46', // emerald-800
  '#115e59', // teal-800
  '#155e75', // cyan-800
  '#1e40af', // blue-800
  '#3730a3', // indigo-800
  '#5b21b6', // purple-800
  '#6b21a8', // violet-800
  '#86198f', // fuchsia-800
  '#9d174d', // pink-800
  
  // Нейтральные цвета
  '#6b7280', // gray-500
  '#9ca3af', // gray-400
  '#374151', // gray-700
  '#d1d5db', // gray-300
  '#111827', // gray-900
  '#f3f4f6', // gray-100
  
  // Специальные цвета
  '#fbbf24', // amber-400 - золотой
  '#f472b6', // pink-400 - коралловый
  '#c084fc', // purple-400 - лавандовый
  '#60a5fa', // blue-400 - небесно-голубой
  '#34d399', // emerald-400 - мятный
  '#a78bfa', // violet-400 - сиреневый
]

const iconOptions = [
  'wallet',
  'home', 
  'trending-up',
  'trending-down',
  'pie-chart',
  'target',
  'bar-chart-3',
  'tag',
  'settings',
  'plus',
  'minus',
  'edit',
  'trash-2',
  'x',
  'check',
  'clock',
  'check-circle',
  'calendar',
  'receipt',
  'briefcase',
  'laptop',
  'shopping-cart',
  'shopping-bag',
  'car',
  'gamepad-2',
  'heart',
  'book',
  'chevron-right',
  'loader-2',
  'save',
  'download',
  'upload',
  'menu',
  'pause',
  'play',
  'refresh-cw',
  'utensils',
  'shirt',
  'smartphone',
  'wifi',
  'fuel',
  'gift',
  'coffee',
  'music',
  'camera',
  'palette'
]

// Вычисляемые свойства
const isEditing = computed(() => !!props.category)

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.color !== '' && 
         form.value.icon !== ''
})

// Инициализация формы
const initForm = () => {
  if (props.category) {
    form.value = {
      name: props.category.name,
      type: props.category.type,
      color: props.category.color,
      icon: props.category.icon
    }
  } else {
    form.value = {
      name: '',
      type: 'income',
      color: '#22c55e',
      icon: 'tag'
    }
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
watch(() => props.category, () => {
  initForm()
}, { immediate: true })
</script>
