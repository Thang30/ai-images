import { db, UsersTable } from '@/lib/drizzle'
import { hashPassword } from '@/lib/auth'

interface NewUser {
  email: string
  password_hash: string
  credits?: number
}

async function createUsers() {
  return [
    {
      email: 'rauchg@vercel.com',
      password_hash: await hashPassword('vercel'),
      credits: 10
    },
    {
      email: 'lee@vercel.com',
      password_hash: await hashPassword('vercel'),
      credits: 10
    }
  ]
}

export async function seed() {
  console.log('🌱 Seeding database...')

  // Delete existing users
  await db.delete(UsersTable)

  // Get users with hashed passwords
  const newUsers = await createUsers()

  // Insert new users
  for (const user of newUsers) {
    await db.insert(UsersTable).values(user)
  }

  console.log('✅ Database seeded successfully')
  return true
}

// Only run seed() if this file is run directly
if (require.main === module) {
  seed().catch(console.error)
}
