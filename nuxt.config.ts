// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true, // Включаем SSR
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys (only available on server-side)
    apiSecret: '123',
    // Public keys (exposed to client-side)
    public: {
      apiBase: '/api'
    }
  },
  app: {
    head: {
      title: 'Finance App - Управление финансами',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Персональное приложение для учета доходов, расходов и управления бюджетом' }
      ]
    }
  },
  compatibilityDate: '2025-10-07',
  components: {
    global: true,
    dirs: ['~/components']
  }
})