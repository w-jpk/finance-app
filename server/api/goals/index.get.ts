import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const status = getQuery(event).status as 'active' | 'completed' | 'paused' | undefined
  const categoryId = getQuery(event).categoryId as string | undefined

  const where: any = { user_id: user.userId }
  if (status) where.status = status
  if (categoryId) where.category_id = categoryId

  const goals = await prisma.goals.findMany({
    where,
    include: {
      categories: true
    },
    orderBy: { created_at: 'desc' }
  })

  // Transform the response to match frontend expectations
  return goals.map(goal => ({
    ...goal,
    targetAmount: Number(goal.target_amount), // Convert Decimal to number
    currentAmount: Number(goal.current_amount), // Convert Decimal to number
    targetDate: goal.target_date,
    categoryId: goal.category_id,
    category: goal.categories, // Include category data
    createdAt: goal.created_at,
    updatedAt: goal.updated_at
  }))
})
