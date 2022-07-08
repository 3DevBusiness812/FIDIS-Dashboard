import BigNumber from 'bignumber.js'

const GELATO_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// export const FEES_NUMERATOR = new BigNumber(9975);
// export const FEES_DENOMINATOR = new BigNumber(10000);

export const MAX_DECIMAL_DIGITS = 6

export interface Currency {
  decimals: number
  symbol?: string
  name?: string
}

export interface Token extends Currency {
  chainId: number
  address: string
  logoUri?: string
}

export const ETHERToken: Token = {
  decimals: 18,
  symbol: 'ETH',
  name: 'native',
  chainId: 0xa,
  address: GELATO_ADDRESS,
}

export const DefaultIndexDecimals = {
  FI25: 8,
  GoldFI: 8,
  MetaFI: 8,
  NFTFI: 8,
  GameFI: 8,
  DeFiFI: 8,
}
