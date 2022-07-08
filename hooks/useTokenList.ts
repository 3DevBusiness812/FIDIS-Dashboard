import { useMemo } from 'react'
import DefaultTokenList from '../config/tokenlist.json'
import { ETHERToken, Token } from '../config/types'

export const useTokenList = (chainId: number) => {
  return useMemo(() => {
    const list = DefaultTokenList.tokens.map((token) => ({
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
      chainId: token.chainId,
      address: token.address,
      logoUri: token.logoURI,
    }))
    return list.filter((token) => token.chainId === chainId)
  }, [chainId])
}

export const useTokenByAddress = (
  chainId: number,
  tokenAddress?: string
): Token | undefined | null => {
  const list = useTokenList(chainId)

  return useMemo(() => {
    if (!tokenAddress) return null
    if (tokenAddress === 'OETH') return ETHERToken

    const tokens = list.filter((token) => token.address === tokenAddress)
    return tokens.length > 0 ? tokens[0] : undefined
  }, [list, tokenAddress])
}

export const useTokenBySymbol = (
  chainId: number,
  symbol?: string
): Token | undefined | null => {
  const list = useTokenList(chainId)

  return useMemo(() => {
    if (!symbol) return null
    if (symbol === 'OETH') return ETHERToken

    const tokens = list.filter((token) => token.symbol === symbol)
    return tokens.length > 0 ? tokens[0] : undefined
  }, [list, symbol])
}
