import { useSelector } from 'react-redux'
import { AppState } from '..'

export const useEthUsdPrice = (): number => {
  return useSelector((state: AppState) => state.application.ethUsdPrice)
}

export const useIndexPrice = (
  symbol: string
): { price: string; swapRate: string } => {
  return useSelector((state: AppState) => state.application.indexPrices[symbol])
}

export const useIndexPrices = () => {
  return useSelector((state: AppState) => state.application.indexPrices)
}

export const useBalance = (symbol: string): number => {
  return useSelector(
    (state: AppState) => state.application.tokenBalances[symbol]
  )
}

export const useBalances = () => {
  return useSelector((state: AppState) => state.application.tokenBalances)
}
