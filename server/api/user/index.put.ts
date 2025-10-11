import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { name, email, currency, initialBalance } = body

  const updatedUser = await prisma.users.update({
    where: { id: user.userId },
    data: { 
      name, 
      email, 
      currency,
      initial_balance: initialBalance !== undefined ? parseFloat(initialBalance) : undefined
    }
  })
  
  // Transform the response to match frontend expectations
  return {
    ...updatedUser,
    initialBalance: Number(updatedUser.initial_balance), // Convert Decimal to number
    createdAt: updatedUser.created_at,
    updatedAt: updatedUser.updated_at
  }
})
