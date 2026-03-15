import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoRules Decision Manager',
  description: 'Create and simulate business rules with GoRules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
