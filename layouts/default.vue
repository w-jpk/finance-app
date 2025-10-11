<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Навигационная панель -->
    <nav class="bg-white shadow-sm border-b border-gray-200 relative z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Icon name="lucide:wallet" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-bold text-gray-900">Finance App</span>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
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

            <!-- Пользователь -->
            <UserActions 
              :user="authStore.user"
              @logout="handleLogout"
            />
            
            <!-- Мобильное меню -->
            <MobileMenuButton 
              :is-open="mobileMenuOpen"
              @toggle="mobileMenuOpen = !mobileMenuOpen"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- Мобильное меню (полноэкранное) -->
    <div 
      v-if="mobileMenuOpen" 
      class="fixed inset-0 z-50 md:hidden"
      @click="mobileMenuOpen = false"
    >
      <!-- Затемнение -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Меню -->
      <div class="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
        <div class="flex flex-col h-full">
          <!-- Заголовок -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Меню</h2>
            <Button 
              variant="ghost"
              size="sm"
              icon="lucide:x"
              @click="mobileMenuOpen = false"
            />
          </div>
          
          <!-- Навигационные ссылки -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-2">
              <NavigationLink
                v-for="link in navigationLinks"
                :key="link.to"
                :to="link.to"
                :icon="link.icon"
                :label="link.label"
                :is-active="isActive(link.to)"
                class="mobile-nav-link"
                :class="{ 'mobile-nav-link-active': isActive(link.to) }"
                @click="mobileMenuOpen = false"
              />
            </div>
          </div>
          
          <!-- Пользователь внизу -->
          <div class="p-4 border-t border-gray-200">
            <div class="flex items-center space-x-3 mb-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Icon name="lucide:user" class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ authStore.user?.name }}</p>
                <p class="text-xs text-gray-500">Пользователь</p>
              </div>
            </div>
            <Button 
              variant="outline"
              size="sm"
              icon="lucide:log-out"
              @click="handleLogout"
              class="w-full"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
interface NavigationLink {
  to: string
  icon: string
  label: string
}

const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
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

const handleLogout = () => {
  authStore.logout()
  navigateTo('/auth')
}

// Закрыть мобильное меню при изменении маршрута
watch(() => useRoute().path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200;
}

.nav-link-active {
  @apply text-primary-600 bg-primary-50;
}

.mobile-nav-link {
  @apply flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 w-full;
}

.mobile-nav-link-active {
  @apply text-primary-600 bg-primary-50;
}
</style>
