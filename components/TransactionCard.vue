<template>
  <div 
    class="group p-3 sm:p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
  >
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
      <!-- Левая часть: иконка и информация -->
      <div class="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
        <div 
          class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
          :style="{ backgroundColor: category?.color + '15' }"
        >
          <Icon 
            :name="`lucide:${category?.icon || 'receipt'}`" 
            class="w-5 h-5 sm:w-6 sm:h-6"
            :style="{ color: category?.color || '#6b7280' }"
          />
        </div>
        
        <div class="flex-1 min-w-0">
          <!-- Название транзакции -->
          <h4 class="font-semibold text-gray-900 text-base sm:text-lg leading-tight mb-1 truncate">
            {{ transaction.description }}
          </h4>
          
          <!-- Категория и тип -->
          <div class="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
            <span 
              class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium"
              :style="{ 
                backgroundColor: (category?.color || '#6b7280') + '20',
                color: category?.color || '#6b7280'
              }"
            >
              <Icon 
                :name="`lucide:${category?.icon || 'receipt'}`" 
                class="w-3 h-3 mr-1"
              />
              <span class="truncate">{{ category?.name || 'Без категории' }}</span>
            </span>
            
            <!-- Тип транзакции -->
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              :class="transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              <Icon 
                :name="transaction.type === 'income' ? 'lucide:trending-up' : 'lucide:trending-down'" 
                class="w-3 h-3 mr-1"
              />
              {{ transaction.type === 'income' ? 'Доход' : 'Расход' }}
            </span>
          </div>
          
          <!-- Дата -->
          <div class="flex items-center text-xs sm:text-sm text-gray-500">
            <Icon name="lucide:calendar" class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span class="truncate">{{ formatDateFull(transaction.date) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Правая часть: сумма -->
      <div class="flex items-center justify-between sm:block sm:text-right">
        <div 
          class="text-xl sm:text-2xl font-bold truncate"
          :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
        >
          {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
        </div>
        
        <!-- Статус -->
        <div class="mt-1 sm:mt-1">
          <span 
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="transaction.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
          >
            <Icon 
              :name="transaction.type === 'income' ? 'lucide:arrow-up-right' : 'lucide:arrow-down-right'" 
              class="w-3 h-3 mr-1"
            />
            <span class="hidden sm:inline">{{ transaction.type === 'income' ? 'Поступление' : 'Списание' }}</span>
            <span class="sm:hidden">{{ transaction.type === 'income' ? 'Поступ.' : 'Списано' }}</span>
          </span>
        </div>
      </div>
    </div>
    
    <!-- Дополнительная информация при наведении -->
    <div class="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-500">
        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
          <span class="truncate">ID: {{ transaction.id.slice(0, 8) }}...</span>
          <span class="truncate">Создано: {{ formatDateTime(transaction.createdAt) }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="ghost"
            size="sm"
            icon="lucide:edit"
            @click.stop="$emit('edit', transaction)"
            title="Редактировать"
            class="p-1"
          />
          <Button 
            variant="ghost"
            size="sm"
            icon="lucide:trash-2"
            @click.stop="$emit('delete', transaction.id)"
            title="Удалить"
            class="p-1 text-gray-400 hover:text-red-600"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, Category } from '~/types'

interface Props {
  transaction: Transaction
  category?: Category | null
}

defineProps<Props>()

defineEmits<{
  edit: [transaction: Transaction]
  delete: [id: string]
}>()

// Утилиты форматирования
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDateFull = (date: Date | string) => {
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'Неверная дата'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj)
}

const formatDateTime = (date: Date | string) => {
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'Неверная дата'
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}
</script>
