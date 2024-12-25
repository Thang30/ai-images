import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-4">Could not find requested resource</p>
      <Link 
        href="/"
        className="text-indigo-600 hover:text-indigo-500"
      >
        Return Home
      </Link>
    </div>
  )
} 