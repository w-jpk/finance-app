<template>
  <div class="space-y-8">
    <!-- Заголовок -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Категории</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">Управление категориями доходов и расходов</p>
      </div>
      <Button variant="primary" icon="lucide:plus" @click="showAddModal = true" class="w-full sm:w-auto">
        <span class="hidden sm:inline">Добавить категорию</span>
        <span class="sm:hidden">Добавить</span>
      </Button>
    </div>

    <!-- Фильтры -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <label class="label">Тип</label>
          <select v-model="typeFilter" class="input-field">
            <option value="">Все типы</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <Button variant="secondary" icon="lucide:x" @click="clearFilters">
            Очистить
          </Button>
        </div>
      </div>
    </div>

    <!-- Категории доходов -->
    <div v-if="!typeFilter || typeFilter === 'income'" class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Категории доходов</h3>
        <span class="text-sm text-gray-500">{{ incomeCategories.length }} категорий</span>
      </div>
      
      <div v-if="incomeCategories.length === 0" class="text-center py-8">
        <Icon name="lucide:trending-up" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Нет категорий доходов</p>
        <p class="text-sm text-gray-400 mt-1">Добавьте первую категорию для доходов</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="category in incomeCategories" 
          :key="category.id"
          class="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: category.color }"
            >
              <Icon 
                :name="`lucide:${category.icon}`" 
                class="w-5 h-5 text-white"
              />
            </div>
            
            <div class="flex space-x-1">
              <button 
                @click="editCategory(category)"
                class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:edit" class="w-4 h-4" />
              </button>
              <button 
                @click="deleteCategory(category.id)"
                class="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <h4 class="font-medium text-gray-900 mb-1">{{ category.name }}</h4>
          <p class="text-sm text-gray-600">Доходы</p>
        </div>
      </div>
    </div>

    <!-- Категории расходов -->
    <div v-if="!typeFilter || typeFilter === 'expense'" class="card">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Категории расходов</h3>
        <span class="text-sm text-gray-500">{{ expenseCategories.length }} категорий</span>
      </div>
      
      <div v-if="expenseCategories.length === 0" class="text-center py-8">
        <Icon name="lucide:trending-down" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Нет категорий расходов</p>
        <p class="text-sm text-gray-400 mt-1">Добавьте первую категорию для расходов</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="category in expenseCategories" 
          :key="category.id"
          class="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
        >
          <div class="flex items-center justify-between mb-3">
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: category.color }"
            >
              <Icon 
                :name="`lucide:${category.icon}`" 
                class="w-5 h-5 text-white"
              />
            </div>
            
            <div class="flex space-x-1">
              <button 
                @click="editCategory(category)"
                class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:edit" class="w-4 h-4" />
              </button>
              <button 
                @click="deleteCategory(category.id)"
                class="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <h4 class="font-medium text-gray-900 mb-1">{{ category.name }}</h4>
          <p class="text-sm text-gray-600">Расходы</p>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <CategoryModal
      v-if="showAddModal || showEditModal"
      :category="editingCategory"
      @close="closeModal"
      @save="handleSaveCategory"
    />
  </div>
</template>

<script setup lang="ts">
// Защита страницы аутентификацией
definePageMeta({
  middleware: 'auth'
})
import { useCategoryStore } from '~/stores/useCategoryStore'
import CategoryModal from '~/components/CategoryModal.vue'
import type { Category, CategoryForm } from '~/types'

// Store
const categoryStore = useCategoryStore()

// Состояние
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingCategory = ref<Category | null>(null)
const typeFilter = ref('')

// Получение данных
const allCategories = computed(() => categoryStore.categories)
const incomeCategories = computed(() => categoryStore.categories.filter(c => c.type === 'income'))
const expenseCategories = computed(() => categoryStore.categories.filter(c => c.type === 'expense'))

// Методы
const editCategory = (category: Category) => {
  editingCategory.value = category
  showEditModal.value = true
}

const deleteCategory = async (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
    try {
      await categoryStore.deleteCategory(id)
    } catch (error) {
      console.error('Ошибка при удалении категории:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingCategory.value = null
}

const handleSaveCategory = async (form: CategoryForm) => {
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, form)
    } else {
      await categoryStore.addCategory(form)
    }
    closeModal()
  } catch (error) {
    console.error('Ошибка при сохранении категории:', error)
  }
}

const clearFilters = () => {
  typeFilter.value = ''
}

// Инициализация
onMounted(async () => {
  await categoryStore.getCategories()
})
</script>
