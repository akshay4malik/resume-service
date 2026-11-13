import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-2LMKFEQCP1';

export const metadata: Metadata = {
  title: 'Kestral AI Labs - ATS Resume Builder & AI Candidate Ranking',
  description: 'Design ATS-optimized resumes and batch-rank candidates against job descriptions with AI precision.',
  icons: {
    icon: '/images/kestral-logo.jpg',
    apple: '/images/kestral-logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-sky-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

