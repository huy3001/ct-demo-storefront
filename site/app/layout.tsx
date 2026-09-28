import type { ReactNode } from 'react';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        {children}
      </body>
    </html>
  );
}
