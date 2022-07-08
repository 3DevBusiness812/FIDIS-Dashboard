import { useCallback, useEffect, useState, useMemo } from 'react'
import { useMoralis } from 'react-moralis'
import { DAPSData, TokenBalance } from '../interfaces'
import { useAppDispatch } from '../state'
import {
  fetchEthUsdPrice,
  fetchIndexPrices,
  fetchBalances,
} from '../state/application'
import { getERC20Contract } from '../utils/contracts'
import { useRefresh } from './useRefresh'
import { useTokenList } from './useTokenList'

export const usePullEthUsdPrice = () => {
  const { fastRefresh, slowRefresh } = useRefresh()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchEthUsdPrice())
  }, [dispatch, fastRefresh])
}

export const useChainId = () => {
  const [chainId, setChaindId] = useState<number>(
    Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  )

  const { web3 } = useMoralis()

  useEffect(() => {
    const fetch = async () => {
      const cId = await web3?.getNetwork()
      setChaindId(cId.chainId)
    }

    if (web3) fetch()
  }, [web3])

  return chainId
}

// Wallet
export const usePullBalances = () => {
  const { fastRefresh, slowRefresh } = useRefresh()
  const dispatch = useAppDispatch()

  const chainId = useChainId()
  const tokens = useTokenList(chainId)

  const { account } = useMoralis()

  useEffect(() => {
    const balances: TokenBalance = {
      FI25: 0,
      GoldFI: 0,
      MetaFI: 0,
      NFTFI: 0,
      GameFI: 0,
      DeFiFI: 0,
    }

    const fetchBal = async () => {
      for (const token of tokens) {
        if (!token.address) continue
        const contract = getERC20Contract(token.address)

        try {
          const bal = (await contract.balanceOf(account)).toString()
          balances[token.symbol] = Number(bal)
        } catch (error) {
          console.error(error)
        }
      }

      // console.log('usePullBalances', balances)
      dispatch(fetchBalances({ balances }))
    }
    if (account && tokens) {
      fetchBal()
    }
  }, [dispatch, account, fastRefresh, tokens])
}

// Websocket
export const usePullDAPS = () => {
  const dispatch = useAppDispatch()

  const { account } = useMoralis()

  useEffect(() => {
    if (!account) return

    const ws = new WebSocket(process.env.NEXT_PUBLIC_DAPS_URL)

    ws.onmessage = (evt: MessageEvent) => {
      const payload = evt.data

      // const payload = JSON.parse(evt.data)

      // dispatch(fetchIndexPrices(payload))
    }

    ws.onopen = (evt: Event) => {
      console.log('websocket opened')
    }

    ws.onclose = (evt: CloseEvent) => {
      console.log('websocket closed', evt)
    }

    ws.onerror = (evt: Event) => {
      console.log('websocket error', evt)
    }

    return () => {
      if (ws) ws.close()
    }
  }, [dispatch])
}
