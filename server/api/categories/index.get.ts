import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const type = getQuery(event).type as 'income' | 'expense' | undefined

  return prisma.categories.findMany({
    where: {
      user_id: user.userId,
      ...(type ? { type } : {}),
    },
    orderBy: { name: 'asc' },
  })
})


