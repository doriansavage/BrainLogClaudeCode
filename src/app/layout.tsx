import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brain E-Log',
  description: 'Interface de gestion logistique Brain E-Log',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
