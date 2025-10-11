import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true }
  } catch (e: any) {
    setResponseStatus(event, 500)
    return { ok: false, error: e?.message || 'DB error' }
  }
})


