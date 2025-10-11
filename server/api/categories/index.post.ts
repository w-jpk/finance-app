import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { name, type, color, icon } = body

  return prisma.categories.create({
    data: { user_id: user.userId, name, type, color, icon },
  })
})


