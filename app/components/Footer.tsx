import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-3">Lubavitch Youth Organization</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serving the NYC Metro area since 1955 with dedication to Jewish outreach and education.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/directory" className="hover:text-white transition">Directory</Link></li>
              <li><Link href="/colleges" className="hover:text-white transition">Colleges</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Services</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>305 Kingston Ave, Brooklyn NY 11213</li>
              <li>
                <a href="tel:718-953-1000" className="hover:text-white transition">718-953-1000</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Lubavitch Youth Organization</span>
          <span className="hidden sm:inline text-gray-600">·</span>
          <a
            href="https://makra.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#d4a853]/50 hover:bg-white/10 transition-all"
          >
            <span className="text-gray-400">Website by</span>
            <span className="text-[#d4a853] font-medium">Makra.ca</span>
            <svg className="w-3.5 h-3.5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
