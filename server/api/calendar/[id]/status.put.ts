import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

const bodySchema = z.object({
  isCompleted: z.boolean()
})

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const eventId = getRouterParam(event, 'id')
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID события обязателен'
    })
  }
  
  const body = await readBody(event)
  const { isCompleted } = bodySchema.parse(body)
  
  // Проверяем, что событие принадлежит пользователю
  const existingEvent = await prisma.calendar_events.findFirst({
    where: {
      id: eventId,
      user_id: user.userId
    }
  })
  
  if (!existingEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Событие не найдено'
    })
  }
  
  const calendarEvent = await prisma.calendar_events.update({
    where: {
      id: eventId
    },
    data: {
      is_completed: isCompleted
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
