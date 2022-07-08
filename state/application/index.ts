import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { DAPSData, TokenBalance } from '../../interfaces'
import { ApplicationState } from './types'

const initialIndexPrices: DAPSData = {
  FI25: {
    price: '0',
    swapRate: '0',
  },
  GoldFI: {
    price: '0',
    swapRate: '0',
  },
  MetaFI: {
    price: '0',
    swapRate: '0',
  },
  NFTFI: {
    price: '0',
    swapRate: '0',
  },
  GameFI: {
    price: '0',
    swapRate: '0',
  },
  DeFiFI: {
    price: '0',
    swapRate: '0',
  },
}

const initialBalances: TokenBalance = {
  FI25: 0,
  GoldFI: 0,
  MetaFI: 0,
  NFTFI: 0,
  GameFI: 0,
  DeFiFI: 0,
}

const initialState: ApplicationState = {
  ethUsdPrice: 0,
  indexPrices: initialIndexPrices,
  tokenBalances: initialBalances,
}

export const fetchEthUsdPrice = createAsyncThunk<number>(
  'application/fetchEthUsdPrice',
  async () => {
    const value = await fetch(
      'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=DZGHMRZIH4KRSSWHQKCUFKPWSD6PJX9K5Z'
    )
    const json = await value.json()
    return Number((json as any).result.ethusd)
  }
)

export const ApplicationSlice = createSlice({
  name: 'Application',
  initialState,
  reducers: {
    fetchIndexPrices: (state, action: PayloadAction<{ prices: DAPSData }>) => {
      const temp = action.payload.prices
      if (temp) state.indexPrices = temp
    },

    fetchBalances: (
      state,
      action: PayloadAction<{ balances: TokenBalance }>
    ) => {
      const temp = action.payload.balances
      if (temp) state.tokenBalances = temp
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchEthUsdPrice.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.ethUsdPrice = action.payload
      }
    )
  },
})

export const { fetchIndexPrices, fetchBalances } = ApplicationSlice.actions

export default ApplicationSlice.reducer
