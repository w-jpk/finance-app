import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  // Получаем актуальные данные пользователя
  const currentUser = await prisma.users.findUnique({
    where: { id: user.userId }
  })

  if (!currentUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  // Возвращаем пользователя без пароля
  const { password_hash, ...userWithoutPassword } = currentUser

  // Transform the response to match frontend expectations
  return {
    ...userWithoutPassword,
    initialBalance: Number(userWithoutPassword.initial_balance), // Convert Decimal to number
    createdAt: userWithoutPassword.created_at,
    updatedAt: userWithoutPassword.updated_at
  }
})
