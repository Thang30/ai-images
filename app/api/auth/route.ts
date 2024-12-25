import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, UsersTable } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'
import { verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, action } = await request.json()
    const cookieStore = await cookies()

    if (action === 'login') {
      const [user] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.email, email))
        .limit(1)

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isValid = await verifyPassword(password, user.password_hash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      cookieStore.set('user_email', user.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'register') {
      const hashedPassword = await hashPassword(password)
      
      const [existingUser] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.email, email))
        .limit(1)

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }

      await db.insert(UsersTable).values({
        email,
        password_hash: hashedPassword,
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'logout') {
      cookieStore.delete('user_email')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 