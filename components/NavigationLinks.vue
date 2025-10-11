<template>
  <div>
    <!-- Десктопная навигация -->
    <div class="hidden md:flex items-center space-x-1">
      <NavigationLink
        v-for="link in navigationLinks"
        :key="link.to"
        :to="link.to"
        :icon="link.icon"
        :label="link.label"
        :is-active="isActive(link.to)"
        class="nav-link"
        :class="{ 'nav-link-active': isActive(link.to) }"
      />
    </div>

    <!-- Мобильная навигация -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
      <div class="px-4 py-2 space-y-1">
        <NavigationLink
          v-for="link in navigationLinks"
          :key="link.to"
          :to="link.to"
          :icon="link.icon"
          :label="link.label"
          :is-active="isActive(link.to)"
          class="mobile-nav-link"
          :class="{ 'mobile-nav-link-active': isActive(link.to) }"
          @click="closeMobileMenu"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavigationLink {
  to: string
  icon: string
  label: string
}

interface Props {
  mobileMenuOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mobileMenuOpen: false
})

const emit = defineEmits<{
  closeMobileMenu: []
}>()

const route = useRoute()

const navigationLinks: NavigationLink[] = [
  {
    to: '/',
    icon: 'lucide:home',
    label: 'Главная'
  },
  {
    to: '/transactions',
    icon: 'lucide:receipt',
    label: 'Транзакции'
  },
  {
    to: '/budget',
    icon: 'lucide:pie-chart',
    label: 'Бюджет'
  },
  {
    to: '/goals',
    icon: 'lucide:target',
    label: 'Цели'
  },
  {
    to: '/calendar',
    icon: 'lucide:calendar',
    label: 'Календарь'
  },
  {
    to: '/reports',
    icon: 'lucide:bar-chart-3',
    label: 'Отчеты'
  },
  {
    to: '/categories',
    icon: 'lucide:tag',
    label: 'Категории'
  },
  {
    to: '/settings',
    icon: 'lucide:settings',
    label: 'Настройки'
  }
]

const isActive = (path: string): boolean => {
  return route.path === path
}

const closeMobileMenu = () => {
  emit('closeMobileMenu')
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200;
}

.nav-link-active {
  @apply text-primary-600 bg-primary-50;
}

.mobile-nav-link {
  @apply flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200;
}

.mobile-nav-link-active {
  @apply text-primary-600 bg-primary-50;
}
</style>
