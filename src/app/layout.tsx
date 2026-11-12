import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

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
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-sky-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

