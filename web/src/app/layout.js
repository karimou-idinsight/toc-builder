import './styles/globals.css'

export const metadata = {
  title: 'Theory of change board',
  description: 'A web app built with Next.js and served by Express.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}