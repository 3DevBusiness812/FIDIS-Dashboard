import { DAPSData, TokenBalance } from '../../interfaces'

export interface ApplicationState {
  ethUsdPrice: number | undefined

  indexPrices: DAPSData | undefined

  tokenBalances: TokenBalance
}
