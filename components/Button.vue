<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <Icon 
      v-if="icon && !loading" 
      :name="icon" 
      :class="iconClasses"
    />
    <Icon 
      v-if="loading" 
      name="lucide:loader-2" 
      :class="[iconClasses, 'animate-spin']"
    />
    <span v-if="slots.default" :class="textClasses">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  // Основные варианты
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  
  // Состояния
  disabled?: boolean
  loading?: boolean
  
  // Иконка
  icon?: string
  iconPosition?: 'left' | 'right'
  
  // HTML атрибуты
  type?: 'button' | 'submit' | 'reset'
  
  // Дополнительные классы
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  type: 'button',
  class: ''
})

const slots = useSlots()

defineEmits<{
  click: [event: MouseEvent]
}>()

// Базовые классы кнопки
const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

// Варианты стилей
const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
}

// Размеры
const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md',
  md: 'px-3 py-2 text-sm rounded-md',
  lg: 'px-4 py-2.5 text-base rounded-lg'
}

// Классы иконки
const iconClasses = computed(() => {
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return sizeMap[props.size]
})

// Классы текста
const textClasses = computed(() => {
  if (!props.icon && !props.loading) return ''
  
  const spacingMap = {
    sm: 'ml-1',
    md: 'ml-2', 
    lg: 'ml-2'
  }
  
  // Если иконка справа, то отступ справа
  if (props.iconPosition === 'right') {
    return spacingMap[props.size].replace('ml-', 'mr-')
  }
  
  return spacingMap[props.size]
})

// Финальные классы кнопки
const buttonClasses = computed(() => {
  const classes = [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.class
  ]
  
  // Добавляем классы для позиционирования иконки
  if ((props.icon || props.loading) && slots.default) {
    if (props.iconPosition === 'right') {
      classes.push('flex-row-reverse')
    }
  }
  
  return classes.filter(Boolean).join(' ')
})
</script>
