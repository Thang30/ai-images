import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, ImagesTable, UsersTable } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'

// Mock function to simulate image generation
function getMockImageUrl(width: number, height: number): string {
  const imageIds = [
    '1', '2', '3', '4', '5',
    '6', '7', '8', '9', '10'
  ]
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)]
  return `https://picsum.photos/id/${randomId}/${width}/${height}`
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if user has credits
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, currentUser.id))
      .limit(1)

    if (!user || user.credits <= 0) {
      return new Response('Insufficient credits', { status: 403 })
    }

    const { prompt, negative_prompt, width, height } = await request.json()

    // Validate input
    if (!prompt || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate mock image URL
    const image_url = getMockImageUrl(width, height)

    // Use a transaction to ensure both operations succeed or fail together
    const result = await db.transaction(async (tx) => {
      // Deduct credit first
      const [updatedUser] = await tx
        .update(UsersTable)
        .set({ credits: user.credits - 1 })
        .where(eq(UsersTable.id, currentUser.id))
        .returning()

      if (!updatedUser) {
        throw new Error('Failed to update credits')
      }

      // Then create the image
      const [newImage] = await tx
        .insert(ImagesTable)
        .values({
          user_id: currentUser.id,
          prompt,
          negative_prompt,
          width,
          height,
          image_url,
        })
        .returning()

      return { user: updatedUser, image: newImage }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 