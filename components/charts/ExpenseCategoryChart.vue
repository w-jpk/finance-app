<template>
  <div class="w-full h-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'

// Регистрируем все компоненты Chart.js
Chart.register(...registerables)

interface Props {
  data: {
    labels: string[]
    data: number[]
    colors: string[]
  }
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement>()

let chart: Chart | null = null

onMounted(() => {
  if (chartCanvas.value) {
    createChart()
  }
})

watch(() => props.data, () => {
  if (chart) {
    updateChart()
  }
}, { deep: true })

const createChart = () => {
  if (!chartCanvas.value) return

  chart = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          data: props.data.data,
          backgroundColor: props.data.colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed
              const total = context.dataset.data.reduce((sum: number, val: any) => sum + val, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

const updateChart = () => {
  if (chart) {
    chart.data.labels = props.data.labels
    chart.data.datasets[0].data = props.data.data
    chart.data.datasets[0].backgroundColor = props.data.colors
    chart.update()
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
