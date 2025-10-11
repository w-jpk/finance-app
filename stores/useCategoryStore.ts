import { defineStore } from 'pinia'
import type { Category, CategoryForm } from '~/types'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  // Инициализация с базовыми категориями
  const initCategories = () => {
    if (categories.value.length === 0) {
      const defaultCategories: Category[] = [
        // Доходы
        {
          id: '1',
          name: 'Зарплата',
          type: 'income',
          color: '#22c55e',
          icon: 'briefcase',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Фриланс',
          type: 'income',
          color: '#3b82f6',
          icon: 'laptop',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Инвестиции',
          type: 'income',
          color: '#8b5cf6',
          icon: 'trending-up',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Расходы
        {
          id: '4',
          name: 'Супермаркет',
          type: 'expense',
          color: '#f59e0b',
          icon: 'shopping-cart',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'Рестораны и Кафе',
          type: 'expense',
          color: '#ef4444',
          icon: 'utensils',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6',
          name: 'Оплата мобильной связи',
          type: 'expense',
          color: '#06b6d4',
          icon: 'smartphone',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '7',
          name: 'Транспорт',
          type: 'expense',
          color: '#f97316',
          icon: 'car',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '8',
          name: 'Маркетплейсы',
          type: 'expense',
          color: '#6366f1',
          icon: 'shopping-bag',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '9',
          name: 'Аренда жилья',
          type: 'expense',
          color: '#84cc16',
          icon: 'home',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '10',
          name: 'Коммунальные услуги',
          type: 'expense',
          color: '#14b8a6',
          icon: 'wifi',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '11',
          name: 'Фастфуд',
          type: 'expense',
          color: '#ec4899',
          icon: 'coffee',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '12',
          name: 'Переводы',
          type: 'expense',
          color: '#8b5cf6',
          icon: 'refresh-cw',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '13',
          name: 'Прочие',
          type: 'expense',
          color: '#9ca3af',
          icon: 'tag',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      categories.value = defaultCategories
    }
  }

  // Получить все категории
  const getCategories = async (type?: 'income' | 'expense') => {
    loading.value = true
    try {
      const authStore = useAuthStore()
      const params = new URLSearchParams()
      if (type) params.append('type', type)
      
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const data = await $fetch<Category[]>(`/api/categories?${params}`, { headers })
      categories.value = data || []
      
      if (type) {
        return categories.value.filter(c => c.type === type)
      }
      
      return [...categories.value]
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to local data
      if (type) {
        return categories.value.filter(c => c.type === type)
      }
      return [...categories.value]
    } finally {
      loading.value = false
    }
  }

  // Добавить категорию
  const addCategory = async (form: CategoryForm) => {
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      
      const newCategory = await $fetch<Category>('/api/categories', {
        method: 'POST',
        headers,
        body: form
      })
      categories.value.push(newCategory)
      return newCategory
    } catch (error) {
      console.error('Error adding category:', error)
      // Fallback to local data
      const newCategory: Category = {
        id: Date.now().toString(),
        name: form.name,
        type: form.type,
        color: form.color,
        icon: form.icon,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      categories.value.push(newCategory)
      return newCategory
    }
  }

  // Обновить категорию
  const updateCategory = async (id: string, form: CategoryForm) => {
    try {
      const updatedCategory = await $fetch<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: form
      })
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      return updatedCategory
    } catch (error) {
      console.error('Error updating category:', error)
      // Fallback to local data
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index],
          name: form.name,
          type: form.type,
          color: form.color,
          icon: form.icon,
          updatedAt: new Date()
        }
        return categories.value[index]
      }
      throw new Error('Категория не найдена')
    }
  }

  // Удалить категорию
  const deleteCategory = async (id: string) => {
    try {
      await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      // Fallback to local data
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value.splice(index, 1)
        return true
      }
      throw new Error('Категория не найдена')
    }
  }

  // Получить категорию по ID
  const getCategoryById = (id: string) => {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories: readonly(categories),
    loading: readonly(loading),
    initCategories,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  }
})
