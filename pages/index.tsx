import { useEffect } from 'react'
import { Moralis } from 'moralis'
import Popup from '../components/main/swap/BuySellToken'
import Dashboard from '../components/main/dashboard'
import Head from 'next/head'
import { useEagerConnect } from '../hooks/useEagerConnect'
import {
  usePullEthUsdPrice,
  usePullDAPS,
  usePullBalances,
} from '../hooks/usePullPrice'
import { useMoralis } from 'react-moralis'

const IndexPage = () => {
  useEagerConnect()
  usePullEthUsdPrice()
  // usePullDAPS()
  usePullBalances()

  const { logout } = useMoralis()

  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ?? '0xA'
  useEffect(() => {
    Moralis.onChainChanged((newChainId) => {
      if (newChainId !== chainId) {
        window.localStorage.removeItem('provider')
        logout()
      }
    })
  }, [logout])

  return (
    <>
      <Head>
        <title>FIDIS | Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <main
        title="FIDIS Crypto Index Assets - Home"
        className="container mx-auto h-full py-6 text-white"
      >
        <Dashboard />
      </main>
    </>
  )
}

export default IndexPage
