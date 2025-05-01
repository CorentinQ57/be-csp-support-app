import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext' // Importer AuthProvider
import EnvCheck from '@/components/EnvCheck'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'BE-CSP Support Web App',
  description: 'Application de support premium pour les partenaires et clients BE-CSP'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${poppins.variable} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <EnvCheck />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

