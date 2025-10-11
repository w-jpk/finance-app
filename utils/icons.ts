// Утилита для работы с иконками Lucide
export const iconNames = [
  'wallet',
  'home', 
  'trending-up',
  'trending-down',
  'pie-chart',
  'target',
  'bar-chart-3',
  'tag',
  'settings',
  'plus',
  'minus',
  'edit',
  'trash-2',
  'x',
  'check',
  'clock',
  'check-circle',
  'calendar',
  'receipt',
  'briefcase',
  'laptop',
  'shopping-cart',
  'shopping-bag',
  'car',
  'gamepad-2',
  'heart',
  'book',
  'chevron-right',
  'loader-2',
  'save',
  'download',
  'upload',
  'menu',
  'pause',
  'play',
  'refresh-cw',
  'utensils',
  'shirt',
  'smartphone',
  'wifi',
  'fuel',
  'gift',
  'coffee',
  'music',
  'camera',
  'palette'
] as const

export type IconName = typeof iconNames[number]

// Функция для проверки валидности имени иконки
export function isValidIconName(name: string): name is IconName {
  return iconNames.includes(name as IconName)
}

// Функция для получения имени иконки из строки
export function getIconName(name: string): IconName {
  const cleanName = name.replace('lucide:', '')
  return isValidIconName(cleanName) ? cleanName : 'wallet'
}
