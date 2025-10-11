import { defineStore } from 'pinia'
import type { Transaction, TransactionForm, TransactionFilters } from '~/types'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)

  // Получить все транзакции
  const getTransactions = async (filters?: TransactionFilters) => {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.categoryId) params.append('categoryId', filters.categoryId)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.selectedMonth) params.append('selectedMonth', filters.selectedMonth)
      
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const data = await $fetch<Transaction[]>(`/api/transactions?${params}`, { headers })
      transactions.value = data || []
      
      return transactions.value
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // Fallback to local data
      let filtered = [...transactions.value]
      
      if (filters?.type) {
        filtered = filtered.filter(t => t.type === filters.type)
      }
      
      if (filters?.categoryId) {
        filtered = filtered.filter(t => t.categoryId === filters.categoryId)
      }
      
      if (filters?.startDate) {
        filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate!))
      }
      
      if (filters?.endDate) {
        filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate!))
      }
      
      if (filters?.selectedMonth) {
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date)
          const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`
          return transactionMonth === filters.selectedMonth
        })
      }
      
      return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } finally {
      loading.value = false
    }
  }

  // Добавить транзакцию
  const addTransaction = async (form: TransactionForm) => {
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const newTransaction = await $fetch<Transaction>('/api/transactions', {
        method: 'POST',
        headers,
        body: {
          ...form,
          occurredOn: form.date
        }
      })
      transactions.value.unshift(newTransaction)
      return newTransaction
    } catch (error) {
      console.error('Error adding transaction:', error)
      // Fallback to local data
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: form.amount,
        description: form.description,
        categoryId: form.categoryId,
        date: new Date(form.date),
        type: form.type,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      transactions.value.unshift(newTransaction)
      return newTransaction
    }
  }

  // Обновить транзакцию
  const updateTransaction = async (id: string, form: TransactionForm) => {
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const updatedTransaction = await $fetch<Transaction>(`/api/transactions/${id}`, {
        method: 'PUT',
        headers,
        body: {
          ...form,
          occurredOn: form.date
        }
      })
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = updatedTransaction
      }
      return updatedTransaction
    } catch (error) {
      console.error('Error updating transaction:', error)
      // Fallback to local data
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = {
          ...transactions.value[index],
          amount: form.amount,
          description: form.description,
          categoryId: form.categoryId,
          date: new Date(form.date),
          type: form.type,
          updatedAt: new Date()
        }
        return transactions.value[index]
      }
      throw new Error('Транзакция не найдена')
    }
  }

  // Удалить транзакцию
  const deleteTransaction = async (id: string) => {
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      await $fetch(`/api/transactions/${id}`, { 
        method: 'DELETE',
        headers
      })
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      // Fallback to local data
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value.splice(index, 1)
        return true
      }
      throw new Error('Транзакция не найдена')
    }
  }

  // Получить транзакцию по ID
  const getTransactionById = (id: string) => {
    return transactions.value.find(t => t.id === id)
  }

  // Получить статистику
  const getStats = () => {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyTransactions = transactions.value.filter(
      t => new Date(t.date) >= currentMonth
    )
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    // Получаем начальный баланс пользователя
    const authStore = useAuthStore()
    const initialBalance = authStore.user?.initialBalance || 0
    
    // Общий баланс = начальный баланс + все доходы - все расходы
    const allIncome = transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const allExpenses = transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalBalance = initialBalance + allIncome - allExpenses
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalBalance, // Общий баланс с учетом начального
      monthlyBalance: totalIncome - totalExpenses, // Баланс только за месяц
      transactionCount: monthlyTransactions.length
    }
  }

  // Получить уникальные месяцы с транзакциями
  const getAvailableMonths = () => {
    const monthSet = new Set<string>()
    
    transactions.value.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthSet.add(monthStr)
    })
    
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
    
    return Array.from(monthSet)
      .sort()
      .reverse() // Сначала новые месяцы
      .map(monthStr => {
        const [year, month] = monthStr.split('-')
        const monthIndex = parseInt(month) - 1
        return {
          value: monthStr,
          label: `${monthNames[monthIndex]} ${year}`
        }
      })
  }

  return {
    transactions: readonly(transactions),
    loading: readonly(loading),
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getStats,
    getAvailableMonths
  }
})
