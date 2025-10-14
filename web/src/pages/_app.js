import '../styles/globals.css'
import { Providers } from '../providers'
import AuthRouter from '../components/AuthRouter'

export default function App({ Component, pageProps }) {
  return (
    <Providers>
      <AuthRouter>
        <Component {...pageProps} />
      </AuthRouter>
    </Providers>
  )
}