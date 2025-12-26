import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import AdminLoginForm from '../components/AdminLoginForm'

export default async function AdminPage() {
  const isAuthenticated = await verifySession()

  if (isAuthenticated) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Admin Login</h1>
          <p className="text-gray-600 mt-2">Enter the admin password to continue</p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  )
}
