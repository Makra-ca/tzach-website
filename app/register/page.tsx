import type { Metadata } from 'next'
import RegisterForm from '../components/RegisterForm'

export const metadata: Metadata = {
  title: 'Register | Tzach Shluchos Recharge',
  description: 'Register for the Tzach Shluchos Recharge.',
}

export default function RegisterPage() {
  return (
    <div className="bg-[#f7f6f3] min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-[#d4a853] mb-2">
            Registration
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0f172a]">
            Tzach Shluchos Recharge
          </h1>
          <p className="mt-3 text-gray-600">
            Please fill out the form below to register.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}
