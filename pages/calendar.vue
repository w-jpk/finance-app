<template>
  <div class="space-y-6">
    <!-- Заголовок страницы -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Календарь расходов</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Планируйте и отслеживайте предстоящие расходы</p>
      </div>
      
      <Button
        variant="primary"
        icon="lucide:plus"
        @click="openAddModal"
        class="w-full sm:w-auto"
      >
        <span class="hidden sm:inline">Добавить событие</span>
        <span class="sm:hidden">Добавить</span>
      </Button>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Icon name="lucide:calendar" class="w-5 h-5 text-blue-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Всего событий</p>
            <p class="text-lg font-semibold text-gray-900">{{ calendarStore.events.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Выполнено</p>
            <p class="text-lg font-semibold text-gray-900">{{ completedEvents }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Просрочено</p>
            <p class="text-lg font-semibold text-gray-900">{{ overdueEvents }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Категория:</label>
          <select
            v-model="selectedCategoryId"
            @change="applyFilters"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Все категории</option>
            <option
              v-for="category in expenseCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Статус:</label>
          <select
            v-model="selectedStatus"
            @change="applyFilters"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Все события</option>
            <option value="pending">Предстоящие</option>
            <option value="completed">Выполненные</option>
            <option value="overdue">Просроченные</option>
          </select>
        </div>
        
        <button
          @click="resetFilters"
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Сбросить
        </button>
      </div>
    </div>

    <!-- Календарь -->
    <div v-if="calendarStore.loading" class="bg-white rounded-lg shadow p-8">
      <div class="text-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-gray-400 mx-auto animate-spin" />
        <p class="text-gray-500 mt-2">Загрузка событий...</p>
      </div>
    </div>
    
    <div v-else-if="calendarStore.error" class="bg-white rounded-lg shadow p-8">
      <div class="text-center">
        <Icon name="lucide:alert-circle" class="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p class="text-red-600 mb-2">Ошибка загрузки событий</p>
        <p class="text-gray-500 text-sm">{{ calendarStore.error }}</p>
        <button 
          @click="calendarStore.fetchEvents()"
          class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
    
    <CalendarComponent
      v-else
      :events="filteredEvents"
      :selected-date="selectedDate"
      @event-selected="selectEvent"
      @day-selected="showDayEvents"
      @date-changed="onDateChanged"
    />

    <!-- Предстоящие события -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Предстоящие события</h3>
      </div>
      <div class="p-4">
        <div v-if="upcomingEvents.length === 0" class="text-center py-8 text-gray-500">
          <Icon name="lucide:calendar-x" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Нет предстоящих событий</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                :class="getEventStatusColor(event)"
              ></div>
              <div>
                <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                <p class="text-sm text-gray-600">
                  {{ formatDate(event.eventDate) }} • {{ formatCurrency(event.amount) }}
                </p>
                <p v-if="event.category" class="text-xs text-gray-500 mt-1">
                  <Icon :name="`lucide:${event.category.icon}`" class="w-3 h-3 inline mr-1" />
                  {{ event.category.name }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Кнопка выполнения для событий на сегодня -->
              <button
                v-if="isEventToday(event)"
                @click="toggleEventStatus(event)"
                class="px-3 py-1 text-xs font-medium rounded-full transition-colors"
                :class="event.isCompleted 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
                :title="event.isCompleted ? 'Отметить как невыполненное' : 'Выполнить событие'"
              >
                <Icon 
                  :name="event.isCompleted ? 'lucide:check-circle' : 'lucide:circle'" 
                  class="w-3 h-3 mr-1" 
                />
                {{ event.isCompleted ? 'Выполнено' : 'Выполнить' }}
              </button>
              
              <button
                @click="toggleEventStatus(event)"
                class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                :title="event.isCompleted ? 'Отметить как невыполненное' : 'Отметить как выполненное'"
              >
                <Icon
                  :name="event.isCompleted ? 'lucide:check-circle' : 'lucide:circle'"
                  class="w-5 h-5"
                  :class="event.isCompleted ? 'text-green-600' : 'text-gray-400'"
                />
              </button>
              <button
                @click="editEvent(event)"
                class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Редактировать"
              >
                <Icon name="lucide:edit" class="w-4 h-4 text-gray-600" />
              </button>
              <button
                @click="deleteEvent(event)"
                class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Удалить"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно события -->
    <CalendarEventModal
      :is-open="isModalOpen"
      :event="selectedEvent"
      @close="closeModal"
      @saved="onEventSaved"
    />

    <!-- Модальное окно событий дня -->
    <div v-if="isDayModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDayModal"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              События на {{ formatDate(selectedDay) }}
            </h3>
            
            <div v-if="dayEvents.length === 0" class="text-center py-4 text-gray-500">
              <p>Нет событий на этот день</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="event in dayEvents"
                :key="event.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-3 h-3 rounded-full"
                    :class="getEventStatusColor(event)"
                  ></div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                    <p class="text-sm text-gray-600">{{ formatCurrency(event.amount) }}</p>
                    <p v-if="event.category" class="text-xs text-gray-500 mt-1">
                      <Icon :name="`lucide:${event.category.icon}`" class="w-3 h-3 inline mr-1" />
                      {{ event.category.name }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="toggleEventStatus(event)"
                    class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Icon
                      :name="event.isCompleted ? 'lucide:check-circle' : 'lucide:circle'"
                      class="w-5 h-5"
                      :class="event.isCompleted ? 'text-green-600' : 'text-gray-400'"
                    />
                  </button>
                  <button
                    @click="editEvent(event)"
                    class="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Icon name="lucide:edit" class="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeDayModal"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '~/types'

const calendarStore = useCalendarStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

// Состояние компонента
const isModalOpen = ref(false)
const isDayModalOpen = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const selectedDay = ref<Date>(new Date())
const selectedDate = ref<Date>(new Date())

// Фильтры
const selectedCategoryId = ref('')
const selectedStatus = ref('')

// Вычисляемые свойства
const expenseCategories = computed(() => 
  categoryStore.categories.filter(cat => cat.type === 'expense')
)

const completedEvents = computed(() => 
  calendarStore.events.filter(event => event.isCompleted).length
)

const overdueEvents = computed(() => 
  calendarStore.events.filter(event => {
    const eventDate = new Date(event.eventDate)
    const today = new Date()
    return eventDate < today && !event.isCompleted
  }).length
)

const upcomingEvents = computed(() => 
  calendarStore.getUpcomingEvents(7)
)

const filteredEvents = computed(() => {
  let events = calendarStore.events

  if (selectedCategoryId.value) {
    events = events.filter(event => event.categoryId === selectedCategoryId.value)
  }

  if (selectedStatus.value) {
    const today = new Date()
    switch (selectedStatus.value) {
      case 'pending':
        events = events.filter(event => {
          const eventDate = new Date(event.eventDate)
          return eventDate >= today && !event.isCompleted
        })
        break
      case 'completed':
        events = events.filter(event => event.isCompleted)
        break
      case 'overdue':
        events = events.filter(event => {
          const eventDate = new Date(event.eventDate)
          return eventDate < today && !event.isCompleted
        })
        break
    }
  }

  return events
})

const dayEvents = computed(() => 
  calendarStore.getEventsForDay(selectedDay.value)
)

// Методы
const openAddModal = () => {
  selectedEvent.value = null
  isModalOpen.value = true
}

const editEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedEvent.value = null
}

const selectEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  isModalOpen.value = true
}

const showDayEvents = (date: Date) => {
  selectedDay.value = date
  isDayModalOpen.value = true
}

const closeDayModal = () => {
  isDayModalOpen.value = false
}

const onDateChanged = (date: Date) => {
  selectedDate.value = date
}

const onEventSaved = () => {
  // Событие уже сохранено в store
}

const toggleEventStatus = async (event: CalendarEvent) => {
  try {
    await calendarStore.toggleEventStatus(event.id, !event.isCompleted)
  } catch (error) {
    console.error('Error toggling event status:', error)
  }
}

const deleteEvent = async (event: CalendarEvent) => {
  if (confirm(`Удалить событие "${event.title}"?`)) {
    try {
      await calendarStore.deleteEvent(event.id)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }
}

const applyFilters = () => {
  // Фильтры применяются через computed свойство
}

const resetFilters = () => {
  selectedCategoryId.value = ''
  selectedStatus.value = ''
}

// Утилиты
const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const getEventStatusColor = (event: CalendarEvent): string => {
  if (event.isCompleted) {
    return 'bg-green-500'
  }
  
  const eventDate = new Date(event.eventDate)
  const today = new Date()
  const isOverdue = eventDate < today && !event.isCompleted
  
  if (isOverdue) {
    return 'bg-red-500'
  }
  
  return 'bg-blue-500'
}

// Проверка, является ли событие сегодняшним
const isEventToday = (event: CalendarEvent): boolean => {
  const eventDate = new Date(event.eventDate)
  const today = new Date()
  
  return eventDate.getFullYear() === today.getFullYear() &&
         eventDate.getMonth() === today.getMonth() &&
         eventDate.getDate() === today.getDate()
}

// Инициализация
onMounted(async () => {
  // Инициализируем аутентификацию
  await authStore.initAuth()
  
  await categoryStore.initCategories()
  await Promise.all([
    calendarStore.fetchEvents(),
    categoryStore.getCategories()
  ])
  
  // Автоматически выполняем события при загрузке страницы
  await calendarStore.autoCompleteEvents()
})
</script>
