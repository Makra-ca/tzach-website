'use client'

import { useState } from 'react'

interface FormState {
  name: string
  makomHaShlichus: string
  email: string
  whatsapp: string
  lunch: boolean
  dinner: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  makomHaShlichus: '',
  email: '',
  whatsapp: '',
  lunch: false,
  dinner: false,
}

export default function RegisterForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4a853]/15">
          <svg
            className="h-7 w-7 text-[#d4a853]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#0f172a] mb-2">
          Thank you for registering!
        </h2>
        <p className="text-gray-600">
          Your registration has been received. We look forward to seeing you.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a853] focus:border-transparent outline-none'

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <div className="mb-5">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-[#d4a853]">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      <div className="mb-5">
        <label htmlFor="makomHaShlichus" className="block text-sm font-medium text-gray-700 mb-2">
          Makom haShlichus <span className="text-[#d4a853]">*</span>
        </label>
        <input
          type="text"
          id="makomHaShlichus"
          value={form.makomHaShlichus}
          onChange={(e) => setForm({ ...form, makomHaShlichus: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-[#d4a853]">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp # <span className="text-[#d4a853]">*</span>
        </label>
        <input
          type="tel"
          id="whatsapp"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      <fieldset className="mb-6">
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Will you be joining for:
        </legend>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-[#d4a853] transition-colors flex-1">
            <input
              type="checkbox"
              checked={form.lunch}
              onChange={(e) => setForm({ ...form, lunch: e.target.checked })}
              className="h-5 w-5 accent-[#d4a853]"
            />
            <span className="text-gray-800">Lunch</span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-[#d4a853] transition-colors flex-1">
            <input
              type="checkbox"
              checked={form.dinner}
              onChange={(e) => setForm({ ...form, dinner: e.target.checked })}
              className="h-5 w-5 accent-[#d4a853]"
            />
            <span className="text-gray-800">Dinner</span>
          </label>
        </div>
      </fieldset>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0f172a] text-white py-3 rounded-lg font-medium hover:bg-[#1e3a5f] transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Register'}
      </button>
    </form>
  )
}
