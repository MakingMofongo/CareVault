import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import AccountSwitcher from '@/components/AccountSwitcher';

function ConditionalAccountSwitcher() {
  'use client';
  // Show AccountSwitcher on all pages for demo purposes
  return <AccountSwitcher />;
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CareVault - Streamlined Clinical Workflow',
  description: 'AI-powered clinical decision support and patient management system',
  keywords: ['healthcare', 'medical', 'prescription', 'patient management', 'clinical workflow'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <ConditionalAccountSwitcher />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}