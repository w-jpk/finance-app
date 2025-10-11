import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const eventId = getRouterParam(event, 'id')
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID события обязателен'
    })
  }
  
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
  
  await prisma.calendar_events.delete({
    where: {
      id: eventId
    }
  })
  
  return { success: true }
})
