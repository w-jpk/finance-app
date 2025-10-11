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
    income: number[]
    expenses: number[]
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
    type: 'line',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          label: 'Доходы',
          data: props.data.income,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Расходы',
          data: props.data.expenses,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y
              return `${context.dataset.label}: ${formatCurrency(value)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(Number(value))
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  })
}

const updateChart = () => {
  if (chart) {
    chart.data.labels = props.data.labels
    chart.data.datasets[0].data = props.data.income
    chart.data.datasets[1].data = props.data.expenses
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
