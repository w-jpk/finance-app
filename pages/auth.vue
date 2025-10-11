<template>
  <div>
    <LoginForm 
      v-if="mode === 'login'"
      @switch-to-register="mode = 'register'"
      @login-success="handleAuthSuccess"
    />
    <RegisterForm 
      v-else
      @switch-to-login="mode = 'login'"
      @register-success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/components/LoginForm.vue'
import RegisterForm from '~/components/RegisterForm.vue'

const mode = ref<'login' | 'register'>('login')

const handleAuthSuccess = () => {
  // Перенаправляем на главную страницу после успешной аутентификации
  navigateTo('/')
}
</script>
