import type { Metadata } from 'next';
import { Logo } from '@/components/icons/logo';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'MoneyDesk',
  description: 'Personal Expense & Income Management SaaS',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
                <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
                    <Logo className="h-8 w-8" />
                    <span className="text-2xl font-bold">MoneyDesk</span>
                </div>
                {children}
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
