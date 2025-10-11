import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')!
  
  await prisma.transactions.delete({ 
    where: { 
      id,
      user_id: user.userId
    } 
  })
  return { ok: true }
})
