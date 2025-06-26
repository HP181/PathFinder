import React from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/sonner"
import './globals.css';
import { Providers } from '@/components/Providers/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PathFinder - Your Path to Success in Canada',
  description: 'PathFinder helps immigrants navigate their career journey in Canada with AI-powered tools and mentorship.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        //   disableTransitionOnChange
        >
           {/* <Providers> */}

          {children}
           {/* </Providers> */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
