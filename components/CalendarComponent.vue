<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Заголовок календаря -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ formatMonthYear(currentDate) }}
        </h2>
        <div class="flex space-x-1">
          <button
            @click="previousMonth"
            class="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title="Предыдущий месяц"
          >
            <Icon name="lucide:chevron-left" class="w-4 h-4 text-gray-600" />
          </button>
          <button
            @click="nextMonth"
            class="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title="Следующий месяц"
          >
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <button
        @click="goToToday"
        class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Сегодня
      </button>
    </div>

    <!-- Дни недели -->
    <div class="grid grid-cols-7 border-b border-gray-200">
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
      >
        {{ day }}
      </div>
    </div>

    <!-- Календарная сетка -->
    <div class="grid grid-cols-7">
      <div
        v-for="day in calendarDays"
        :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`"
        class="min-h-[120px] border-r border-b border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
        :class="{
          'bg-gray-50': !day.isCurrentMonth,
          'bg-white': day.isCurrentMonth
        }"
      >
        <div class="p-2">
          <!-- Номер дня -->
          <div
            class="text-sm font-medium mb-1"
            :class="{
              'text-gray-400': !day.isCurrentMonth,
              'text-gray-900': day.isCurrentMonth && !day.isToday,
              'text-white bg-primary-600 rounded-full w-6 h-6 flex items-center justify-center': day.isToday
            }"
          >
            {{ day.date.getDate() }}
          </div>

          <!-- События дня -->
          <div class="space-y-1">
            <div
              v-for="event in day.events"
              :key="event.id"
              @click="selectEvent(event)"
              class="text-xs p-1 rounded cursor-pointer transition-colors"
              :class="getEventClasses(event)"
              :title="`${event.title} - ${formatCurrency(event.amount)}`"
            >
              <div class="truncate font-medium">{{ event.title }}</div>
              <div class="truncate text-gray-600">{{ formatCurrency(event.amount) }}</div>
              <div v-if="event.category" class="truncate text-xs text-gray-500">
                <Icon :name="`lucide:${event.category.icon}`" class="w-2 h-2 inline mr-1" />
                {{ event.category.name }}
              </div>
            </div>
            
            <!-- Показать больше событий -->
            <div
              v-if="day.events.length > 2"
              @click="showDayEvents(day.date)"
              class="text-xs text-primary-600 hover:text-primary-700 cursor-pointer font-medium"
            >
              +{{ day.events.length - 2 }} еще
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '~/types'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

interface Props {
  events: CalendarEvent[]
  selectedDate?: Date
}

interface Emits {
  (e: 'event-selected', event: CalendarEvent): void
  (e: 'day-selected', date: Date): void
  (e: 'date-changed', date: Date): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentDate = ref(new Date())
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Вычисляем дни календаря
const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Первый день месяца
  const firstDay = new Date(year, month, 1)
  // Последний день месяца
  const lastDay = new Date(year, month + 1, 0)
  
  // Начало недели (понедельник)
  const startDate = new Date(firstDay)
  const dayOfWeek = (firstDay.getDay() + 6) % 7 // Преобразуем воскресенье (0) в 6
  startDate.setDate(firstDay.getDate() - dayOfWeek)
  
  // Конец недели
  const endDate = new Date(lastDay)
  const endDayOfWeek = (lastDay.getDay() + 6) % 7
  endDate.setDate(lastDay.getDate() + (6 - endDayOfWeek))
  
  const days: CalendarDay[] = []
  const today = new Date()
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayEvents = props.events.filter(event => {
      const eventDate = new Date(event.eventDate)
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate()
    })
    
    days.push({
      date: new Date(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.getFullYear() === today.getFullYear() &&
               date.getMonth() === today.getMonth() &&
               date.getDate() === today.getDate(),
      events: dayEvents.slice(0, 2) // Показываем только первые 2 события
    })
  }
  
  return days
})

// Форматирование месяца и года
const formatMonthYear = (date: Date): string => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

// Форматирование валюты
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

// Получение классов для события
const getEventClasses = (event: CalendarEvent): string => {
  const baseClasses = 'border-l-2'
  
  if (event.isCompleted) {
    return `${baseClasses} bg-green-50 border-green-400 text-green-800`
  }
  
  const eventDate = new Date(event.eventDate)
  const today = new Date()
  const isOverdue = eventDate < today && !event.isCompleted
  
  if (isOverdue) {
    return `${baseClasses} bg-red-50 border-red-400 text-red-800`
  }
  
  return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`
}

// Навигация по месяцам
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  emit('date-changed', currentDate.value)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  emit('date-changed', currentDate.value)
}

const goToToday = () => {
  currentDate.value = new Date()
  emit('date-changed', currentDate.value)
}

// Выбор события
const selectEvent = (event: CalendarEvent) => {
  emit('event-selected', event)
}

// Показать все события дня
const showDayEvents = (date: Date) => {
  emit('day-selected', date)
}

// Синхронизация с внешним selectedDate
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    currentDate.value = new Date(newDate)
  }
})
</script>
