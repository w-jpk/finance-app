import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const type = query.type as 'income' | 'expense' | undefined
  const categoryId = query.categoryId as string | undefined
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined
  const selectedMonth = query.selectedMonth as string | undefined

  const where: any = {
    user_id: user.userId,
    ...(type ? { type } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
  }

  if (startDate || endDate) {
    where.occurred_on = {}
    if (startDate) where.occurred_on.gte = new Date(startDate)
    if (endDate) where.occurred_on.lte = new Date(endDate)
  }

  if (selectedMonth) {
    // Parse selectedMonth (format: YYYY-MM)
    const [year, month] = selectedMonth.split('-')
    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
    
    where.occurred_on = {
      gte: startOfMonth,
      lte: endOfMonth
    }
  }

  const transactions = await prisma.transactions.findMany({
    where,
    include: {
      categories: true
    },
    orderBy: { occurred_on: 'desc' }
  })

  // Transform the response to match frontend expectations
  return transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount), // Convert Decimal to number
    date: transaction.occurred_on,
    categoryId: transaction.category_id,
    category: transaction.categories, // Include category data
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at
  }))
})
