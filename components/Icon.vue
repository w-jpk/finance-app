<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { 
  Wallet, 
  Home, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Target, 
  BarChart3, 
  Tag, 
  Settings,
  Plus,
  Minus,
  Edit,
  Trash2,
  X,
  Check,
  Clock,
  CheckCircle,
  Calendar,
  Receipt,
  Briefcase,
  Laptop,
  ShoppingCart,
  Car,
  Gamepad2,
  Heart,
  Book,
  ChevronRight,
  Loader2,
  Save,
  Download,
  Upload,
  Menu,
  Pause,
  Play,
  RefreshCw,
  ShoppingBag,
  Utensils,
  Shirt,
  Smartphone,
  Wifi,
  Fuel,
  Gift,
  Coffee,
  Music,
  Camera,
  Palette
} from 'lucide-vue-next'
import { getIconName } from '~/utils/icons'

interface Props {
  name: string
}

const props = defineProps<Props>()

// Маппинг имен иконок на компоненты
const iconMap: Record<string, any> = {
  wallet: Wallet,
  home: Home,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'pie-chart': PieChart,
  target: Target,
  'bar-chart-3': BarChart3,
  tag: Tag,
  settings: Settings,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  'trash-2': Trash2,
  x: X,
  check: Check,
  clock: Clock,
  'check-circle': CheckCircle,
  calendar: Calendar,
  receipt: Receipt,
  briefcase: Briefcase,
  laptop: Laptop,
  'shopping-cart': ShoppingCart,
  car: Car,
  'gamepad-2': Gamepad2,
  heart: Heart,
  book: Book,
  'chevron-right': ChevronRight,
  'loader-2': Loader2,
  save: Save,
  download: Download,
  upload: Upload,
  menu: Menu,
  pause: Pause,
  play: Play,
  'refresh-cw': RefreshCw,
  'shopping-bag': ShoppingBag,
  utensils: Utensils,
  shirt: Shirt,
  smartphone: Smartphone,
  wifi: Wifi,
  fuel: Fuel,
  gift: Gift,
  coffee: Coffee,
  music: Music,
  camera: Camera,
  palette: Palette
}

// Получаем компонент иконки
const iconComponent = computed(() => {
  const iconName = getIconName(props.name)
  return iconMap[iconName] || Wallet
})
</script>
