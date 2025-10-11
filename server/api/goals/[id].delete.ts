import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/middleware'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')!
  
  await prisma.goals.delete({ 
    where: { 
      id,
      user_id: user.userId // Ensure user owns the goal
    } 
  })
  
  return { ok: true }
})
