import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { name, type, color, icon } = body

  return prisma.categories.update({
    where: { id },
    data: { name, type, color, icon },
  })
})


