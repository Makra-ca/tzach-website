import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Lubavitch Youth Organization | Chabad Directory NYC Metro",
  description: "Find your local Chabad House in the NYC Metro area. Over 200 shluchim couples and 170 centers serving Long Island, Westchester, and the five boroughs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical CSS - must be first so it's ready when script runs */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .preloader-skip .preloader-container { display: none !important; }
              .preloader-skip .hero-animate { visibility: hidden; }
              @keyframes fadeSlideIn { 0% { visibility: visible; opacity: 0; transform: translateX(-40px); } 100% { visibility: visible; opacity: 1; transform: none; } }
              .preloader-skip .hero-animate { animation: fadeSlideIn 0.6s ease-out 0.1s forwards; }
            `,
          }}
        />
        {/* Check session and add class - CSS above will immediately hide preloader */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('lyo-preloader-shown')) {
                  document.documentElement.classList.add('preloader-skip');
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased flex flex-col min-h-screen"
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
