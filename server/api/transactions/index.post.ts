import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { categoryId, type, amount, description, occurredOn } = body

  // If no category provided, create or find a default "Без категории" category
  let finalCategoryId = categoryId && categoryId.trim() !== '' ? categoryId : null
  
  if (!finalCategoryId) {
    // Find or create default category
    const defaultCategory = await prisma.categories.findFirst({
      where: {
        user_id: user.userId,
        name: 'Без категории',
        type: type
      }
    })
    
    if (defaultCategory) {
      finalCategoryId = defaultCategory.id
    } else {
      const newDefaultCategory = await prisma.categories.create({
        data: {
          user_id: user.userId,
          name: 'Без категории',
          type: type,
          color: '#6b7280',
          icon: 'tag'
        }
      })
      finalCategoryId = newDefaultCategory.id
    }
  }

  const transaction = await prisma.transactions.create({
    data: {
      user_id: user.userId,
      category_id: finalCategoryId,
      type,
      amount: parseFloat(amount),
      description,
      occurred_on: new Date(occurredOn)
    },
    include: {
      categories: true
    }
  })

  // Transform the response to match frontend expectations
  return {
    ...transaction,
    amount: Number(transaction.amount), // Convert Decimal to number
    date: transaction.occurred_on,
    categoryId: transaction.category_id,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at
  }
})
