import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { status } = body

  const goal = await prisma.goals.update({
    where: { 
      id,
      user_id: user.userId // Ensure user owns the goal
    },
    data: { status },
    include: {
      categories: true
    }
  })

  // Transform the response to match frontend expectations
  return {
    ...goal,
    targetAmount: Number(goal.target_amount), // Convert Decimal to number
    currentAmount: Number(goal.current_amount), // Convert Decimal to number
    targetDate: goal.target_date,
    categoryId: goal.category_id,
    category: goal.categories, // Include category data
    createdAt: goal.created_at,
    updatedAt: goal.updated_at
  }
})
