import { defineStore } from 'pinia'
import type { Goal, GoalForm } from '~/types'

export const useGoalStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const loading = ref(false)

  // Получить все цели
  const getGoals = async () => {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const data = await $fetch<Goal[]>('/api/goals', { headers })
      goals.value = data || []
      return [...goals.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error('Error fetching goals:', error)
      // Fallback to local data
      return [...goals.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } finally {
      loading.value = false
    }
  }

  // Добавить цель
  const addGoal = async (form: GoalForm) => {
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const newGoal = await $fetch<Goal>('/api/goals', {
        method: 'POST',
        headers,
        body: form
      })
      goals.value.unshift(newGoal)
      return newGoal
    } catch (error) {
      console.error('Error adding goal:', error)
      // Fallback to local data
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: form.title,
        description: form.description,
        targetAmount: form.targetAmount,
        currentAmount: 0,
        targetDate: new Date(form.targetDate),
        categoryId: form.categoryId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      goals.value.unshift(newGoal)
      return newGoal
    }
  }

  // Обновить цель
  const updateGoal = async (id: string, form: GoalForm) => {
    try {
      const updatedGoal = await $fetch<Goal>(`/api/goals/${id}`, {
        method: 'PUT',
        body: form
      })
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index] = updatedGoal
      }
      return updatedGoal
    } catch (error) {
      console.error('Error updating goal:', error)
      // Fallback to local data
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        const currentAmount = goals.value[index].currentAmount
        goals.value[index] = {
          ...goals.value[index],
          title: form.title,
          description: form.description,
          targetAmount: form.targetAmount,
          targetDate: new Date(form.targetDate),
          categoryId: form.categoryId,
          updatedAt: new Date()
        }
        return goals.value[index]
      }
      throw new Error('Цель не найдена')
    }
  }

  // Удалить цель
  const deleteGoal = async (id: string) => {
    try {
      await $fetch(`/api/goals/${id}`, { method: 'DELETE' })
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('Error deleting goal:', error)
      // Fallback to local data
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value.splice(index, 1)
        return true
      }
      throw new Error('Цель не найдена')
    }
  }

  // Обновить прогресс цели
  const updateGoalProgress = async (id: string, amount: number) => {
    try {
      const updatedGoal = await $fetch<Goal>(`/api/goals/${id}/progress`, {
        method: 'PUT',
        body: { currentAmount: amount }
      })
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index] = updatedGoal
      }
      return updatedGoal
    } catch (error) {
      console.error('Error updating goal progress:', error)
      // Fallback to local data
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index].currentAmount = Math.max(0, Math.min(amount, goals.value[index].targetAmount))
        
        // Автоматически завершить цель, если достигнута
        if (goals.value[index].currentAmount >= goals.value[index].targetAmount) {
          goals.value[index].status = 'completed'
        }
        
        goals.value[index].updatedAt = new Date()
        return goals.value[index]
      }
      throw new Error('Цель не найдена')
    }
  }

  // Изменить статус цели
  const updateGoalStatus = async (id: string, status: 'active' | 'completed' | 'paused') => {
    try {
      const updatedGoal = await $fetch<Goal>(`/api/goals/${id}/status`, {
        method: 'PUT',
        body: { status }
      })
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index] = updatedGoal
      }
      return updatedGoal
    } catch (error) {
      console.error('Error updating goal status:', error)
      // Fallback to local data
      const index = goals.value.findIndex(g => g.id === id)
      if (index !== -1) {
        goals.value[index].status = status
        goals.value[index].updatedAt = new Date()
        return goals.value[index]
      }
      throw new Error('Цель не найдена')
    }
  }

  // Получить цель по ID
  const getGoalById = (id: string) => {
    return goals.value.find(g => g.id === id)
  }

  // Получить статистику целей
  const getGoalsStats = () => {
    const total = goals.value.length
    const completed = goals.value.filter(g => g.status === 'completed').length
    const active = goals.value.filter(g => g.status === 'active').length
    const paused = goals.value.filter(g => g.status === 'paused').length
    
    return {
      total,
      completed,
      active,
      paused,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  }

  return {
    goals: readonly(goals),
    loading: readonly(loading),
    getGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    updateGoalStatus,
    getGoalById,
    getGoalsStats
  }
})
