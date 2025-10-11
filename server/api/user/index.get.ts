import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const userData = await prisma.users.findUnique({
    where: { id: user.userId }
  })
  
  if (!userData) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }
  
  // Transform the response to match frontend expectations
  return {
    ...userData,
    initialBalance: Number(userData.initial_balance), // Convert Decimal to number
    createdAt: userData.created_at,
    updatedAt: userData.updated_at
  }
})
