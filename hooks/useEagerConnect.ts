import Moralis from 'moralis'
import { useEffect } from 'react'
import { useMoralis } from 'react-moralis'

export const useEagerConnect = () => {
  const {
    enableWeb3,
    isAuthenticated,
    isAuthenticating,
    isWeb3Enabled,
    isWeb3EnableLoading,
  } = useMoralis()

  useEffect(() => {
    const enable = async () => {
      const provider = window.localStorage.getItem('provider')

      if (
        provider &&
        isAuthenticated &&
        !isAuthenticating &&
        !isWeb3Enabled &&
        !isWeb3EnableLoading
      ) {
        enableWeb3({
          provider: provider as Moralis.Web3ProviderType,
        })
      }
    }
    enable()
  }, [
    enableWeb3,
    isAuthenticated,
    isAuthenticating,
    isWeb3Enabled,
    isWeb3EnableLoading,
  ])
}
