import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { MoralisProvider } from 'react-moralis'
import Layout from '../components/Layout'
import { RefreshContextProvider } from '../contexts/RefreshContext'
import store from '../state'
import '../styles/globals.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider
      appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
      serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_URL}
    >
      <Provider store={store}>
        <RefreshContextProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RefreshContextProvider>
      </Provider>
    </MoralisProvider>
  )
}

export default MyApp
