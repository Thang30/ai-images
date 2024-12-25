'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function GenerateForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formData.get('prompt'),
          negative_prompt: formData.get('negative_prompt'),
          width: Number(formData.get('width')),
          height: Number(formData.get('height')),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      // First refresh to update server components
      await router.refresh()
      
      // Small delay to ensure refresh completes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Then navigate to home
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <input
          type="text"
          name="prompt"
          id="prompt"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="negative_prompt" className="block text-sm font-medium text-gray-700">
          Negative Prompt (Optional)
        </label>
        <input
          type="text"
          name="negative_prompt"
          id="negative_prompt"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700">
            Width
          </label>
          <input
            type="number"
            name="width"
            id="width"
            required
            defaultValue={512}
            min={64}
            max={1024}
            step={64}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">
            Height
          </label>
          <input
            type="number"
            name="height"
            id="height"
            required
            defaultValue={512}
            min={64}
            max={1024}
            step={64}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  )
} 