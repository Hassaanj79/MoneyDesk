import { Logo } from '@/components/icons/logo';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <Logo className="h-8 w-8" />
            <span className="text-2xl font-bold">MoneyDesk</span>
        </div>
        {children}
    </div>
  );
}
