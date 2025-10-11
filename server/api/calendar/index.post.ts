import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

const bodySchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  amount: z.number().positive('Сумма должна быть положительной'),
  eventDate: z.string().min(1, 'Дата события обязательна'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).optional()
})

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const body = await readBody(event)
  const { title, description, amount, eventDate, categoryId, recurrence } = bodySchema.parse(body)
  
  // Проверяем, что категория принадлежит пользователю
  const category = await prisma.categories.findFirst({
    where: {
      id: categoryId,
      user_id: user.userId
    }
  })
  
  if (!category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Категория не найдена'
    })
  }
  
  const calendarEvent = await prisma.calendar_events.create({
    data: {
      user_id: user.userId,
      category_id: categoryId,
      title,
      description,
      amount,
      event_date: new Date(eventDate),
      recurrence: recurrence || 'none'
    },
    include: {
      categories: true
    }
  })
  
  return {
    id: calendarEvent.id,
    title: calendarEvent.title,
    description: calendarEvent.description,
    amount: Number(calendarEvent.amount),
    eventDate: calendarEvent.event_date,
    categoryId: calendarEvent.category_id,
    category: {
      id: calendarEvent.categories.id,
      name: calendarEvent.categories.name,
      type: calendarEvent.categories.type,
      color: calendarEvent.categories.color,
      icon: calendarEvent.categories.icon
    },
    recurrence: calendarEvent.recurrence,
    isCompleted: calendarEvent.is_completed,
    createdAt: calendarEvent.created_at,
    updatedAt: calendarEvent.updated_at
  }
})
