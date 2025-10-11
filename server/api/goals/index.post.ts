import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { title, description, targetAmount, targetDate, categoryId } = body

  // Validate categoryId - if empty string, set to null
  const validCategoryId = categoryId && categoryId.trim() !== '' ? categoryId : null

  const goal = await prisma.goals.create({
    data: {
      user_id: user.userId,
      title,
      description,
      target_amount: parseFloat(targetAmount),
      target_date: new Date(targetDate),
      category_id: validCategoryId
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
