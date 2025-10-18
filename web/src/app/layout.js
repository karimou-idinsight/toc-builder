import '../styles/globals.css'
import { Providers } from '../providers'

export const metadata = {
  title: 'Theory of Change Builder',
  description: 'Create, visualize, and manage your Theory of Change with an intuitive drag-and-drop interface',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
