import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await prisma.categories.delete({ where: { id } })
  return { ok: true }
})


