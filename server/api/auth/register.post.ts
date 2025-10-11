import { prisma } from '~/server/utils/prisma'
import { hashPassword, comparePassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, currency = 'RUB' } = body

  // Валидация
  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email and password are required'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters long'
    })
  }

  // Проверка существования пользователя
  const existingUser = await prisma.users.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User with this email already exists'
    })
  }

  // Хеширование пароля
  const passwordHash = await hashPassword(password)

  // Создание пользователя
  const user = await prisma.users.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
      currency
    }
  })

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
