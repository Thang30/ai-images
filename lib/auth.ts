import { compare, hash } from 'bcryptjs'
import { cookies } from 'next/headers'
import { db, UsersTable } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'

interface User {
  id: string
  email: string
  credits: number
}

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

export async function getCurrentUser(): Promise<User | null> {
  const userEmail = cookies().get('user_email')?.value
  
  if (!userEmail) return null
  
  const [user] = await db
    .select({
      id: UsersTable.id,
      email: UsersTable.email,
      credits: UsersTable.credits
    })
    .from(UsersTable)
    .where(eq(UsersTable.email, userEmail))
    .limit(1)
  
  return user || null
} 