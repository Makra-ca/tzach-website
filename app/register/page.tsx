import type { Metadata } from 'next'
import Image from 'next/image'
import RegisterForm from '../components/RegisterForm'

export const metadata: Metadata = {
  title: 'Register | Tzach Shluchos Recharge',
  description: 'Register for the Tzach Shluchos Recharge.',
}

export default function RegisterPage() {
  return (
    <div className="bg-[#f7f6f3] min-h-screen">
      {/* Navy hero band */}
      <section className="relative bg-gradient-to-b from-[#0f172a] to-[#13203b] overflow-hidden">
        {/* Decorative gold glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#d4a853]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-[#d4a853]/5 blur-3xl" />

        <div className="relative max-w-xl mx-auto px-4 pt-14 pb-28 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/tzach logo.bmp"
              alt="Lubavitch Youth Organization"
              width={72}
              height={72}
              className="rounded invert"
              priority
            />
          </div>

          <p className="text-[#d4a853] font-semibold tracking-[0.22em] uppercase text-xs sm:text-sm mb-3">
            Registration
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight">
            Tzach Shluchos Recharge
          </h1>

          {/* Gold divider */}
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#d4a853]/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4a853]" />
            <span className="h-px w-10 bg-[#d4a853]/40" />
          </div>

          <p className="mt-5 text-gray-300 leading-relaxed">
            Please fill out the form below to reserve your place.
          </p>
        </div>
      </section>

      {/* Form card overlapping the hero */}
      <section className="px-4 pb-16">
        <div className="relative max-w-xl mx-auto -mt-16">
          {/* Signature offset gold accent card */}
          <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#d4a853]/20 rounded-2xl" aria-hidden />
          <div className="relative">
            <RegisterForm />
          </div>
        </div>

        {/* Brand tie-in */}
        <p className="mt-10 text-center text-xs uppercase tracking-[0.18em] text-gray-400">
          Lubavitch Youth Organization · Celebrating 70 Years
        </p>
      </section>
    </div>
  )
}
