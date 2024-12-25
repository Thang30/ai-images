import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { LogoutButton } from './LogoutButton'
import ExpandingArrow from './expanding-arrow'

export async function Navbar() {
  const currentUser = await getCurrentUser()

  return (
    <nav className="w-full p-4 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          AI Images
          <ExpandingArrow className="h-4 w-4" />
        </Link>
        <div className="flex items-center space-x-6">
          <Link 
            href="/generate" 
            className="text-gray-600 hover:text-black flex items-center gap-2"
          >
            Generate
            <ExpandingArrow className="h-3 w-3" />
          </Link>
          <Link 
            href="/gallery" 
            className="text-gray-600 hover:text-black flex items-center gap-2"
          >
            Gallery
            <ExpandingArrow className="h-3 w-3" />
          </Link>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{currentUser.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="text-gray-600 hover:text-black flex items-center gap-2"
            >
              Sign In
              <ExpandingArrow className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 