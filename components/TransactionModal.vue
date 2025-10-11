<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Заголовок -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Редактировать транзакцию' : 'Добавить транзакцию' }}
          </h3>
          <Button 
            variant="ghost"
            size="sm"
            icon="lucide:x"
            @click="$emit('close')"
          />
        </div>

        <!-- Форма -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Тип транзакции -->
          <div v-if="!props.transactionType">
            <label class="label">Тип транзакции</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.type = 'expense'"
                class="p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                :class="form.type === 'expense' 
                  ? 'border-red-500 bg-red-50 shadow-md' 
                  : 'border-gray-200 hover:border-red-300'"
              >
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icon name="lucide:trending-down" class="w-5 h-5 text-red-600" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-gray-900">Расход</p>
                    <p class="text-sm text-gray-600">Трата средств</p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                @click="form.type = 'income'"
                class="p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                :class="form.type === 'income' 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-green-300'"
              >
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="lucide:trending-up" class="w-5 h-5 text-green-600" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-gray-900">Доход</p>
                    <p class="text-sm text-gray-600">Поступление средств</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Сумма -->
          <div>
            <label class="label">Сумма</label>
            <div class="relative">
              <input 
                v-model.number="form.amount" 
                type="number" 
                step="0.01"
                min="0"
                class="input-field pr-8"
                placeholder="0"
                required
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₽
              </span>
            </div>
          </div>

          <!-- Описание -->
          <div>
            <label class="label">Описание</label>
            <input 
              v-model="form.description" 
              type="text" 
              class="input-field"
              placeholder="Введите описание транзакции"
              required
            />
          </div>

          <!-- Категория -->
          <div>
            <label class="label">Категория</label>
            <select v-model="form.categoryId" class="input-field" required>
              <option value="">Выберите категорию</option>
              <option 
                v-for="category in filteredCategories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Дата -->
          <div>
            <label class="label">Дата</label>
            <input 
              v-model="form.date" 
              type="date" 
              class="input-field"
              required
            />
          </div>

          <!-- Кнопки -->
          <div class="flex space-x-3 pt-4">
            <Button 
              type="button"
              variant="secondary"
              size="md"
              @click="$emit('close')"
              class="flex-1"
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              variant="primary"
              size="md"
              :disabled="!isFormValid"
              class="flex-1"
            >
              {{ isEditing ? 'Сохранить' : 'Добавить' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionForm, Category } from '~/types'

interface Props {
  transaction?: Transaction | null
  categories: Category[]
  transactionType?: 'income' | 'expense' | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [form: TransactionForm]
}>()

// Состояние формы
const form = ref<TransactionForm>({
  amount: 0,
  description: '',
  categoryId: '',
  date: new Date().toISOString().split('T')[0],
  type: props.transactionType || 'expense'
})

// Вычисляемые свойства
const isEditing = computed(() => !!props.transaction)

const filteredCategories = computed(() => {
  return props.categories.filter(c => c.type === form.value.type)
})

const isFormValid = computed(() => {
  return form.value.amount > 0 && 
         form.value.description.trim() !== '' && 
         form.value.categoryId !== '' && 
         form.value.date !== ''
})

// Инициализация формы
const initForm = () => {
  if (props.transaction) {
    form.value = {
      amount: props.transaction.amount,
      description: props.transaction.description,
      categoryId: props.transaction.categoryId,
      date: new Date(props.transaction.date).toISOString().split('T')[0],
      type: props.transaction.type
    }
  } else {
    form.value = {
      amount: 0,
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      type: props.transactionType || 'expense'
    }
  }
}

// Обработка отправки формы
const handleSubmit = () => {
  if (isFormValid.value) {
    emit('save', { ...form.value })
  }
}

// Сброс категории при изменении типа
watch(() => form.value.type, () => {
  form.value.categoryId = ''
})

// Инициализация при монтировании
onMounted(() => {
  initForm()
})

// Инициализация при изменении пропсов
watch(() => props.transaction, () => {
  initForm()
}, { immediate: true })

watch(() => props.transactionType, () => {
  if (!props.transaction) {
    initForm()
  }
}, { immediate: true })

</script>
