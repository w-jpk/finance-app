import { prisma } from '~/server/utils/prisma'
import { comparePassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  // Валидация
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }

  // Поиск пользователя
  const user = await prisma.users.findUnique({
    where: { email }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  // Проверка пароля
  const isValidPassword = await comparePassword(password, user.password_hash)
  
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }

  // Генерация JWT токена
  const token = generateToken({
    userId: user.id,
    email: user.email
  })

  // Возвращаем пользователя без пароля
  const { password_hash, ...userWithoutPassword } = user

  // Transform the response to match frontend expectations
  return {
    user: {
      ...userWithoutPassword,
      initialBalance: Number(userWithoutPassword.initial_balance), // Convert Decimal to number
      createdAt: userWithoutPassword.created_at,
      updatedAt: userWithoutPassword.updated_at
    },
    token
  }
})
