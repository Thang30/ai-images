import Image from 'next/image'
import { db, ImagesTable } from '@/lib/drizzle'
import { getCurrentUser } from '@/lib/auth'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

interface GalleryPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function GalleryPage({
  searchParams,
}: GalleryPageProps) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/auth')
  }

  const images = await db
    .select()
    .from(ImagesTable)
    .where(eq(ImagesTable.user_id, currentUser.id))
    .orderBy(desc(ImagesTable.created_at))
    .limit(20)

  // Handle searchParams safely
  const params = await Promise.resolve(searchParams)
  const newImageId = typeof params?.new === 'string' ? params.new : undefined

  return (
    <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm relative"
          >
            {newImageId === image.id && (
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Newly Generated
                </span>
              </div>
            )}
            <div className="aspect-square relative">
              <Image 
                src={image.image_url}
                alt={image.prompt}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">Prompt: {image.prompt}</p>
              {image.negative_prompt && (
                <p className="text-sm text-gray-500 mt-1">
                  Negative: {image.negative_prompt}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 