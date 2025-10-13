import './styles/globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Theory of change board',
  description: 'A web app built with Next.js and served by Express.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}