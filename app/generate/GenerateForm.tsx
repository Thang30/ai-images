'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function GenerateForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        prompt: formData.get('prompt'),
        negative_prompt: formData.get('negative_prompt'),
        width: Number(formData.get('width')),
        height: Number(formData.get('height')),
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      router.refresh()
      router.push('/gallery')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="A serene landscape with mountains..."
          required
        />
      </div>
      
      <div>
        <label htmlFor="negative_prompt" className="block text-sm font-medium text-gray-700">
          Negative Prompt (Optional)
        </label>
        <textarea
          id="negative_prompt"
          name="negative_prompt"
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="blurry, low quality..."
        />
      </div>
      
      <div className="flex gap-4">
        <div className="w-1/2">
          <label htmlFor="width" className="block text-sm font-medium text-gray-700">
            Width
          </label>
          <select
            id="width"
            name="width"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            defaultValue="512"
            required
          >
            <option value="512">512px</option>
            <option value="1024">1024px</option>
          </select>
        </div>
        
        <div className="w-1/2">
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">
            Height
          </label>
          <select
            id="height"
            name="height"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            defaultValue="512"
            required
          >
            <option value="512">512px</option>
            <option value="1024">1024px</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  )
} 