import { verifyToken, extractTokenFromHeader } from '~/server/utils/auth'

export interface AuthenticatedUser {
  userId: string
  email: string
}

export function getAuthenticatedUser(event: any): AuthenticatedUser | null {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    return null
  }
  
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }
  
  return {
    userId: payload.userId,
    email: payload.email
  }
}

export function requireAuth(event: any): AuthenticatedUser {
  const user = getAuthenticatedUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Invalid or missing token'
    })
  }
  
  return user
}
