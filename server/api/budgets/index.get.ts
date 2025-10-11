import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const budgets = await prisma.budgets.findMany({
    where: { user_id: user.userId },
    include: {
      categories: true
    },
    orderBy: { created_at: 'desc' }
  })

  // Transform the response to match frontend expectations
  return budgets.map(budget => ({
    ...budget,
    amount: Number(budget.amount), // Convert Decimal to number
    startDate: budget.start_date,
    endDate: budget.end_date,
    categoryId: budget.category_id,
    category: budget.categories ? {
      id: budget.categories.id,
      name: budget.categories.name,
      type: budget.categories.type,
      color: budget.categories.color,
      icon: budget.categories.icon,
      createdAt: budget.categories.created_at,
      updatedAt: budget.categories.updated_at
    } : undefined,
    createdAt: budget.created_at,
    updatedAt: budget.updated_at
  }))
})
