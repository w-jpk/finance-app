import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { categoryId, amount, period, startDate, endDate } = body

  // Validate categoryId - if empty string, set to null
  const validCategoryId = categoryId && categoryId.trim() !== '' ? categoryId : null

  const budget = await prisma.budgets.update({
    where: { id },
    data: {
      category_id: validCategoryId,
      amount: parseFloat(amount),
      period,
      start_date: new Date(startDate),
      end_date: new Date(endDate)
    },
    include: {
      categories: true
    }
  })

  // Transform the response to match frontend expectations
  return {
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
  }
})
