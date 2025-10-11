import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { currentAmount } = body

  // Get current goal to check target amount
  const currentGoal = await prisma.goals.findUnique({
    where: { 
      id,
      user_id: user.userId // Ensure user owns the goal
    },
    select: { target_amount: true }
  })

  if (!currentGoal) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Goal not found'
    })
  }

  const goal = await prisma.goals.update({
    where: { 
      id,
      user_id: user.userId // Ensure user owns the goal
    },
    data: {
      current_amount: parseFloat(currentAmount),
      status: parseFloat(currentAmount) >= Number(currentGoal.target_amount) ? 'completed' : 'active'
    },
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
