import { defineStore } from 'pinia'
import type { Budget, BudgetForm } from '~/types'

export const useBudgetStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([])
  const loading = ref(false)

  // Получить все бюджеты
  const getBudgets = async () => {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const data = await $fetch<Budget[]>('/api/budgets', { headers })
      budgets.value = data || []
      return [...budgets.value]
    } catch (error) {
      console.error('Error fetching budgets:', error)
      // Fallback to local data
      return [...budgets.value]
    } finally {
      loading.value = false
    }
  }

  // Добавить бюджет
  const addBudget = async (form: BudgetForm) => {
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const newBudget = await $fetch<Budget>('/api/budgets', {
        method: 'POST',
        headers,
        body: form
      })
      budgets.value.push(newBudget)
      return newBudget
    } catch (error) {
      console.error('Error adding budget:', error)
      // Fallback to local data
      const newBudget: Budget = {
        id: Date.now().toString(),
        categoryId: form.categoryId,
        amount: form.amount,
        period: form.period,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      budgets.value.push(newBudget)
      return newBudget
    }
  }

  // Обновить бюджет
  const updateBudget = async (id: string, form: BudgetForm) => {
    try {
      const updatedBudget = await $fetch<Budget>(`/api/budgets/${id}`, {
        method: 'PUT',
        body: form
      })
      const index = budgets.value.findIndex(b => b.id === id)
      if (index !== -1) {
        budgets.value[index] = updatedBudget
      }
      return updatedBudget
    } catch (error) {
      console.error('Error updating budget:', error)
      // Fallback to local data
      const index = budgets.value.findIndex(b => b.id === id)
      if (index !== -1) {
        budgets.value[index] = {
          ...budgets.value[index],
          categoryId: form.categoryId,
          amount: form.amount,
          period: form.period,
          startDate: new Date(form.startDate),
          endDate: new Date(form.endDate),
          updatedAt: new Date()
        }
        return budgets.value[index]
      }
      throw new Error('Бюджет не найден')
    }
  }

  // Удалить бюджет
  const deleteBudget = async (id: string) => {
    try {
      await $fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      const index = budgets.value.findIndex(b => b.id === id)
      if (index !== -1) {
        budgets.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('Error deleting budget:', error)
      // Fallback to local data
      const index = budgets.value.findIndex(b => b.id === id)
      if (index !== -1) {
        budgets.value.splice(index, 1)
        return true
      }
      throw new Error('Бюджет не найден')
    }
  }

  // Получить бюджет по ID
  const getBudgetById = (id: string) => {
    return budgets.value.find(b => b.id === id)
  }

  // Получить активные бюджеты
  const getActiveBudgets = () => {
    const now = new Date()
    return budgets.value.filter(b => 
      new Date(b.startDate) <= now && new Date(b.endDate) >= now
    )
  }

  return {
    budgets: readonly(budgets),
    loading: readonly(loading),
    getBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetById,
    getActiveBudgets
  }
})
