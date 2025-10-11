import { z } from 'zod'
import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  isCompleted: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const query = await getQuery(event)
  const { startDate, endDate, categoryId, isCompleted } = querySchema.parse(query)
  
  const where: any = {
    user_id: user.userId
  }
  
  if (startDate && endDate) {
    where.event_date = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }
  
  if (categoryId) {
    where.category_id = categoryId
  }
  
  if (isCompleted !== undefined) {
    where.is_completed = isCompleted === 'true'
  }
  
  const events = await prisma.calendar_events.findMany({
    where,
    include: {
      categories: true
    },
    orderBy: {
      event_date: 'asc'
    }
  })
  
  return events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    amount: Number(event.amount),
    eventDate: event.event_date,
    categoryId: event.category_id,
    category: event.categories ? {
      id: event.categories.id,
      name: event.categories.name,
      type: event.categories.type,
      color: event.categories.color,
      icon: event.categories.icon
    } : undefined,
    recurrence: event.recurrence,
    isCompleted: event.is_completed,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  }))
})
