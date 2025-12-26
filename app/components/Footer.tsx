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

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Lubavitch Youth Organization
        </div>
      </div>
    </footer>
  )
}
