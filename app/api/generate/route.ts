import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db, ImagesTable, UsersTable } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'
import { fal } from "@fal-ai/client"

if (!process.env.FAL_KEY) {
  throw new Error('FAL_KEY environment variable is not set')
}

// Configure fal client with the correct credentials format
fal.config({
  proxyUrl: "/api/fal/proxy",
  credentials: process.env.FAL_KEY,
})

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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

    // Generate image using FAL.ai
    const result = await fal.subscribe("110602490-lora", {
      input: {
        prompt,
        negative_prompt: negative_prompt || "",
        model_name: "stabilityai/stable-diffusion-xl-base-1.0",
        image_size: width === height ? "square_hd" : "landscape_16_9",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 2147483647),
      },
      pollInterval: 1000,
      logs: true,
      onQueueUpdate(update) {
        if (update.status === 'FAILED') {
          console.error('Queue update failed:', update)
        } else {
          console.log('Queue update:', update.status)
        }
      },
    })

    console.log('FAL response:', result)

    // Extract image URL from the correct response structure
    const imageUrl = result.data?.images?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL in response: ' + JSON.stringify(result))
    }

    // Use a transaction to ensure both operations succeed or fail together
    const dbResult = await db.transaction(async (tx) => {
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
          image_url: imageUrl,
        })
        .returning()

      return { user: updatedUser, image: newImage }
    })

    return NextResponse.json(dbResult)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 