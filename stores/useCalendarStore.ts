import { defineStore } from 'pinia'
import type { CalendarEvent, CalendarEventForm } from '~/types'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Получить события календаря
  const fetchEvents = async (filters?: {
    startDate?: string
    endDate?: string
    categoryId?: string
    isCompleted?: boolean
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const query = new URLSearchParams()
      if (filters?.startDate) query.append('startDate', filters.startDate)
      if (filters?.endDate) query.append('endDate', filters.endDate)
      if (filters?.categoryId) query.append('categoryId', filters.categoryId)
      if (filters?.isCompleted !== undefined) query.append('isCompleted', filters.isCompleted.toString())
      
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const data = await $fetch<CalendarEvent[]>(`/api/calendar?${query.toString()}`, { headers })
      events.value = data
      
      // Автоматически выполнить события при загрузке
      await autoCompleteEvents()
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке событий'
      console.error('Error fetching calendar events:', err)
    } finally {
      loading.value = false
    }
  }

  // Создать новое событие
  const createEvent = async (eventData: CalendarEventForm) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const newEvent = await $fetch<CalendarEvent>('/api/calendar', {
        method: 'POST',
        headers,
        body: eventData
      })
      
      events.value.push(newEvent)
      return newEvent
    } catch (err: any) {
      error.value = err.message || 'Ошибка при создании события'
      console.error('Error creating calendar event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновить событие
  const updateEvent = async (eventId: string, eventData: CalendarEventForm) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const updatedEvent = await $fetch<CalendarEvent>(`/api/calendar/${eventId}`, {
        method: 'PUT',
        headers,
        body: eventData
      })
      
      const index = events.value.findIndex(event => event.id === eventId)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      
      return updatedEvent
    } catch (err: any) {
      error.value = err.message || 'Ошибка при обновлении события'
      console.error('Error updating calendar event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удалить событие
  const deleteEvent = async (eventId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      await $fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
        headers
      })
      
      events.value = events.value.filter(event => event.id !== eventId)
    } catch (err: any) {
      error.value = err.message || 'Ошибка при удалении события'
      console.error('Error deleting calendar event:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Отметить событие как выполненное/невыполненное
  const toggleEventStatus = async (eventId: string, isCompleted: boolean) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const updatedEvent = await $fetch<CalendarEvent>(`/api/calendar/${eventId}/status`, {
        method: 'PUT',
        headers,
        body: { isCompleted }
      })
      
      const index = events.value.findIndex(event => event.id === eventId)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      
      return updatedEvent
    } catch (err: any) {
      error.value = err.message || 'Ошибка при изменении статуса события'
      console.error('Error toggling calendar event status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить события для конкретного месяца
  const getEventsForMonth = (year: number, month: number) => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    return events.value.filter(event => {
      const eventDate = new Date(event.eventDate)
      return eventDate >= startDate && eventDate <= endDate
    })
  }

  // Получить события для конкретного дня
  const getEventsForDay = (date: Date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    return events.value.filter(event => {
      const eventDate = new Date(event.eventDate)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      return eventDateOnly.getTime() === targetDate.getTime()
    })
  }

  // Получить предстоящие события (включая сегодня)
  const getUpcomingEvents = (days: number = 7) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Начало дня
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000))
    
    return events.value.filter(event => {
      const eventDate = new Date(event.eventDate)
      eventDate.setHours(0, 0, 0, 0) // Начало дня для корректного сравнения
      return eventDate >= today && eventDate <= futureDate && !event.isCompleted
    }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
  }

  // Автоматически выполнить события при достижении даты
  const autoCompleteEvents = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const eventsToComplete = events.value.filter(event => {
      const eventDate = new Date(event.eventDate)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === today.getTime() && !event.isCompleted
    })
    
    for (const event of eventsToComplete) {
      try {
        await toggleEventStatus(event.id, true)
      } catch (error) {
        console.error(`Error auto-completing event ${event.id}:`, error)
      }
    }
  }

  return {
    events: readonly(events),
    loading: readonly(loading),
    error: readonly(error),
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    getEventsForMonth,
    getEventsForDay,
    getUpcomingEvents,
    autoCompleteEvents,
    clearError
  }
})
