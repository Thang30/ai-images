import Image from 'next/image'
import { db, ImagesTable } from '@/lib/drizzle'
import { desc } from 'drizzle-orm'

export default async function GalleryPage() {
  const images = await db
    .select()
    .from(ImagesTable)
    .orderBy(desc(ImagesTable.created_at))
    .limit(20)

  return (
    <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
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