import { compare, hash } from 'bcryptjs'
import { cookies } from 'next/headers'
import { db, UsersTable } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

export async function getCurrentUser() {
  const userEmail = cookies().get('user_email')?.value
  
  if (!userEmail) return null
  
  const [user] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, userEmail))
    .limit(1)
  
  return user || null
} 