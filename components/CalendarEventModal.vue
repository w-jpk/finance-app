<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ selectedEvent ? 'Редактировать событие' : 'Добавить событие' }}
                </h3>
                
                <div class="space-y-4">
                  <!-- Название -->
                  <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      Название *
                    </label>
                    <input
                      id="title"
                      v-model="form.title"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Например: Оплата аренды"
                    />
                  </div>

                  <!-- Описание -->
                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      id="description"
                      v-model="form.description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Дополнительная информация о событии"
                    ></textarea>
                  </div>

                  <!-- Сумма -->
                  <div>
                    <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
                      Сумма *
                    </label>
                    <div class="relative">
                      <input
                        id="amount"
                        v-model.number="form.amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.00"
                      />
                      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 text-sm">₽</span>
                      </div>
                    </div>
                  </div>

                  <!-- Дата события -->
                  <div>
                    <label for="eventDate" class="block text-sm font-medium text-gray-700 mb-1">
                      Дата события *
                    </label>
                    <input
                      id="eventDate"
                      v-model="form.eventDate"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <!-- Категория -->
                  <div>
                    <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">
                      Категория *
                    </label>
                    <select
                      id="categoryId"
                      v-model="form.categoryId"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Выберите категорию</option>
                      <option
                        v-for="category in expenseCategories"
                        :key="category.id"
                        :value="category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Повторение -->
                  <div>
                    <label for="recurrence" class="block text-sm font-medium text-gray-700 mb-1">
                      Повторение
                    </label>
                    <select
                      id="recurrence"
                      v-model="form.recurrence"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="none">Не повторять</option>
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                      <option value="yearly">Ежегодно</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              variant="primary"
              size="md"
              :disabled="loading"
              :icon="loading ? 'lucide:loader-2' : undefined"
              class="w-full sm:ml-3 sm:w-auto"
            >
              {{ selectedEvent ? 'Сохранить' : 'Добавить' }}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              @click="closeModal"
              class="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent, CalendarEventForm } from '~/types'

interface Props {
  isOpen: boolean
  event?: CalendarEvent | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved', event: CalendarEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const calendarStore = useCalendarStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref<CalendarEventForm>({
  title: '',
  description: '',
  amount: 0,
  eventDate: '',
  categoryId: '',
  recurrence: 'none'
})

// Computed свойство для удобства
const selectedEvent = computed(() => props.event)

// Получаем только категории расходов
const expenseCategories = computed(() => 
  categoryStore.categories.filter(cat => cat.type === 'expense')
)

// Инициализация формы
const initializeForm = () => {
  if (props.event) {
    form.value = {
      title: props.event.title,
      description: props.event.description || '',
      amount: props.event.amount,
      eventDate: new Date(props.event.eventDate).toISOString().split('T')[0],
      categoryId: props.event.categoryId,
      recurrence: props.event.recurrence || 'none'
    }
  } else {
    form.value = {
      title: '',
      description: '',
      amount: 0,
      eventDate: new Date().toISOString().split('T')[0],
      categoryId: '',
      recurrence: 'none'
    }
  }
}

// Обработка отправки формы
const handleSubmit = async () => {
  if (!form.value.title || !form.value.amount || !form.value.eventDate || !form.value.categoryId) {
    return
  }

  loading.value = true
  
  try {
    let savedEvent: CalendarEvent
    
    if (props.event) {
      savedEvent = await calendarStore.updateEvent(props.event.id, form.value)
    } else {
      savedEvent = await calendarStore.createEvent(form.value)
    }
    
    emit('saved', savedEvent)
    closeModal()
  } catch (error) {
    console.error('Error saving calendar event:', error)
  } finally {
    loading.value = false
  }
}

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}

// Инициализация формы при открытии модального окна
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initializeForm()
  }
})

// Загружаем категории при монтировании
onMounted(() => {
  // Инициализируем аутентификацию
  authStore.initAuth()
  
  if (categoryStore.categories.length === 0) {
    categoryStore.initCategories()
    categoryStore.getCategories()
  }
})
</script>
