'use client'

import { useState } from 'react'
import Image from 'next/image'

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
      <div className="relative bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-8 sm:p-10 text-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a]" />
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4a853]/15 ring-4 ring-[#d4a853]/10">
          <svg
            className="h-8 w-8 text-[#d4a853]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0f172a] mb-3">
          Thank you for registering!
        </h2>
        <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
          Your registration has been received. We look forward to seeing you at the
          Tzach Shluchos Recharge.
        </p>
        <div className="mx-auto mt-6 h-px w-16 bg-[#d4a853]/40" />
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-[#faf9f7] border border-gray-200 text-[#0f172a] placeholder-gray-400 transition-all outline-none focus:bg-white focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/30'

  const mealCard = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all flex-1 focus-within:ring-2 focus-within:ring-[#d4a853]/40 ${
      active
        ? 'border-[#d4a853] bg-[#d4a853]/10 shadow-sm'
        : 'border-gray-200 hover:border-[#d4a853]/50 bg-white'
    }`

  const checkBox = (active: boolean) =>
    `flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
      active ? 'border-[#d4a853] bg-[#d4a853]' : 'border-gray-300'
    }`

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6 sm:p-8 overflow-hidden"
    >
      {/* Gold brand accent bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a]" />

      <div className="mb-6">
        <span className="text-[#d4a853] font-semibold tracking-[0.18em] uppercase text-xs">
          Your Details
        </span>
        <div className="mt-2 h-px w-full bg-gradient-to-r from-[#d4a853]/30 to-transparent" />
      </div>

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

      <fieldset className="mb-7">
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Will you be joining for:
        </legend>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className={mealCard(form.lunch)}>
            <input
              type="checkbox"
              checked={form.lunch}
              onChange={(e) => setForm({ ...form, lunch: e.target.checked })}
              className="sr-only"
            />
            <span className={checkBox(form.lunch)}>
              {form.lunch && (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-[#0f172a] font-medium">Lunch</span>
          </label>
          <label className={mealCard(form.dinner)}>
            <input
              type="checkbox"
              checked={form.dinner}
              onChange={(e) => setForm({ ...form, dinner: e.target.checked })}
              className="sr-only"
            />
            <span className={checkBox(form.dinner)}>
              {form.dinner && (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-[#0f172a] font-medium">Dinner</span>
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
        className="group w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#d4a853] to-[#e5bc6a] text-[#0f172a] rounded-full font-semibold shadow-lg shadow-[#d4a853]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#d4a853]/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting…' : 'Submit Registration'}
        <span className="flex items-center justify-center w-7 h-7 bg-[#0f172a]/10 rounded-full transition-all duration-300 group-hover:bg-[#0f172a]/20 group-hover:translate-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>

      <p className="mt-4 text-center text-xs text-gray-400">
        We&apos;ll only use your details to coordinate the event.
      </p>
    </form>
  )
}
