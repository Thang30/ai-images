import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { GenerateForm } from './GenerateForm'

export default async function GeneratePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Generate Image</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <GenerateForm />
        </div>
      </div>
    </div>
  )
} 