// Основные типы для финансового приложения

export interface User {
  id: string
  name: string
  email: string
  currency: string
  initialBalance: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  amount: number
  description: string
  categoryId: string
  category?: Category
  date: Date
  type: 'income' | 'expense'
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  categoryId: string
  category?: Category
  amount: number
  period: 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  categoryId?: string
  category?: Category
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  updatedAt: Date
}

export interface Report {
  period: string
  totalIncome: number
  totalExpenses: number
  balance: number
  categories: {
    categoryId: string
    categoryName: string
    amount: number
    percentage: number
  }[]
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyBalance: number
  goalsProgress: {
    total: number
    completed: number
    inProgress: number
  }
}

// Типы для форм
export interface TransactionForm {
  amount: number
  description: string
  categoryId: string
  date: string
  type: 'income' | 'expense'
}

export interface CategoryForm {
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

export interface BudgetForm {
  categoryId: string
  amount: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate: string
}

export interface GoalForm {
  title: string
  description: string
  targetAmount: number
  targetDate: string
  categoryId?: string
}

// Типы для фильтров
export interface TransactionFilters {
  type?: 'income' | 'expense'
  categoryId?: string
  startDate?: string
  endDate?: string
  selectedMonth?: string
}

export interface ReportFilters {
  period: 'month' | 'quarter' | 'year'
  selectedMonth?: string
  selectedQuarter?: string
  selectedYear?: string
  categoryId?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  amount: number
  eventDate: Date
  categoryId: string
  category?: Category
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CalendarEventForm {
  title: string
  description?: string
  amount: number
  eventDate: string
  categoryId: string
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
}
  categoryId: string
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
}