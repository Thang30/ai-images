'use client'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Something went wrong!
        </h2>
        <p className="mt-2 text-gray-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 