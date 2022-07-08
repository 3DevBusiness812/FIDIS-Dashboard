import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'

import { useIndexPrices, useBalances } from '../../../state/application/hooks'
import { getBalanceNumber } from '../../../utils/balance'

import FI25_icon from '../../../assets/images/token_icons/fi25coin.png'
import FIDIS_icon from '../../../assets/images/token_icons/fidiscoin.png'
import GOLDFI_icon from '../../../assets/images/token_icons/fi10.png'
import METAFI_icon from '../../../assets/images/token_icons/metafi.png'

import { MarketCapItem, MarketCapList } from '../../../interfaces'

const styles = {
  outlined_button:
    'py-1 px-2 text-sm text-orange-FIDIS border border-orange-FIDIS rounded-lg text-center',
}

const dummy_data: MarketCapList = {
  FI25: {
    token_name: 'FI25',
    token_icon: FI25_icon,
    decimals: 8,
    balance: 0,
    balance_in_dollars: 0,
    change: 0,
    change_percentage: 0,
  },
  GoldFI: {
    token_name: 'GoldFI',
    token_icon: GOLDFI_icon,
    decimals: 8,
    balance: 0,
    balance_in_dollars: 0,
    change: 0,
    change_percentage: 0,
  },
  MetaFI: {
    token_name: 'MetaFI',
    token_icon: METAFI_icon,
    decimals: 8,
    balance: 0,
    balance_in_dollars: 0,
    change: 0,
    change_percentage: 0,
  },
  NFTFI: {
    token_name: 'NFTFI',
    token_icon: FIDIS_icon,
    decimals: 8,
    balance: 0,
    balance_in_dollars: 0,
    change: 0,
    change_percentage: 0,
  },
  GameFI: {
    token_name: 'GameFI',
    token_icon: FIDIS_icon,
    decimals: 8,
    balance: 0,
    balance_in_dollars: 0,
    change: 0,
    change_percentage: 0,
  },
  DeFiFI: {
    token_name: 'DeFiFi',
    token_icon: FIDIS_icon,
    decimals: 8,
    balance: 0,
    balance_in_dollars: 0,
    change: 0,
    change_percentage: 0,
  },
}

const MarketCap = () => {
  const indexBalances = useBalances()
  const indexPrices = useIndexPrices()

  let tokenList = useMemo(() => {
    let tokens = dummy_data

    Object.keys(dummy_data).map((key) => {
      const symbol = tokens[key].token_name
      const balance = indexBalances[key] // wei
      const ethBal = getBalanceNumber(balance, tokens[key].decimals)
      tokens[key].balance = ethBal.toFixed(3)
      tokens[key].balance_in_dollars = (
        ethBal * Number(indexPrices[key].price)
      ).toFixed(3)
    })

    return tokens
  }, [indexBalances, indexPrices])

  if (!tokenList) tokenList = dummy_data

  const mcObj = Object.keys(tokenList)

  return (
    <div className="scrolltype col-span-5  w-full overflow-auto  rounded bg-black/30 px-3 py-6 pt-2 ">
      <nav className="flex items-center justify-between py-2">
        <h1 className="text-xl font-medium">Market Cap</h1>
      </nav>
      <div className="market-cap-table w-full border-collapse text-left ">
        <div className="mr-4 flex items-center justify-between whitespace-nowrap border-y border-gray-300/30 text-center text-xs text-gray-300/80">
          <div className="basis-5/12 py-2 text-left xxl:py-6">Token Name</div>
          <div className="basis-3/12 text-center font-medium text-green-increased-value">
            Balance
          </div>
          <div className="basis-4/12 text-right">24 Hr Change</div>
        </div>
        <div className="pr-4 ">
          {mcObj.map((key, index) => (
            <div
              key={index}
              // dont add a border bottom to the last raw
              className={`flex items-center justify-between ${
                index !== mcObj.length - 1
                  ? 'border-b-[1px] border-b-slate-600'
                  : ''
              } py-2 text-right`}
            >
              <div className="flex basis-5/12 items-center gap-2 py-3 font-bold">
                <Image
                  src={tokenList[key].token_icon}
                  height={26}
                  width={26}
                  alt={`${tokenList[key].token_name} icon`}
                />
                {tokenList[key].token_name}
              </div>
              <div
                className={`${
                  tokenList[key].balance === 0 ? 'text-orange-FIDIS' : ''
                } basis-3/12 text-center font-bold`}
              >
                {tokenList[key].balance}
                {tokenList[key].balance_in_dollars !== 0 && (
                  <span className="block text-xs font-medium text-green-increased-value">
                    ≈ ${tokenList[key].balance_in_dollars}
                  </span>
                )}
              </div>
              <div className="basis-4/12 font-bold">
                $ {tokenList[key].change}
                <span
                  className={`block text-xs font-medium ${
                    tokenList[key].change_percentage >= 0
                      ? 'text-green-increased-value'
                      : 'text-red-decreased-value'
                  }`}
                >
                  {tokenList[key].change_percentage > 0
                    ? '+' + tokenList[key].change_percentage
                    : tokenList[key].change_percentage}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketCap
