import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, ImagesTable } from '@/lib/drizzle'

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
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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

    // Save to database
    const [newImage] = await db
      .insert(ImagesTable)
      .values({
        user_id: user.id,
        prompt,
        negative_prompt,
        width,
        height,
        image_url,
      })
      .returning()

    return NextResponse.json({ image: newImage })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 