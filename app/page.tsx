import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { db, ImagesTable } from '@/lib/drizzle'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function Home() {
  const images = await db.select().from(ImagesTable).orderBy(ImagesTable.created_at)

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">AI Images</Link>
          <div className="space-x-4">
            <Link href="/generate" className="text-gray-600 hover:text-black">Generate</Link>
            <Link href="/gallery" className="text-gray-600 hover:text-black">Gallery</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Generated Images</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="border rounded-lg overflow-hidden">
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

      {/* Footer */}
      <footer className="w-full bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2024 AI Images. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="text-sm text-gray-600 hover:text-black">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-black">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-black">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}