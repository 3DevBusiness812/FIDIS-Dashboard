import Link from 'next/link'
import Head from 'next/head'
import React, { ChangeEvent, useState, useEffect, useRef } from 'react'
import Moralis from 'moralis'
import { useMoralis } from 'react-moralis'
// import { Signer } from '@ethersproject/abstract-signer'
// import { Provider, Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { getERC20Contract } from '../../../utils/contracts'
import { useEthUsdPrice, useIndexPrice } from '../../../state/application/hooks'
import { TransactionData } from '../../../interfaces'
import { useTokenBySymbol } from '../../../hooks/useTokenList'
import { useChainId } from '../../../hooks/usePullPrice'
import Notification from '../../constants/Notification'
import { sign } from 'crypto'
// import { MongoClient } from 'mongodb'

const styles = {
  buy_sell_buttons:
    'border-b w-full border-orange-FIDIS px-12 py-3 text-2xl font-bold ',
  popup_input:
    'border w-full border-orange-FIDIS py-3 px-4 text-xl text-white/50 ',
  popup_token_select:
    'mr-4 w-[120px] border-none rounded-r font-bold text-2xl text-center w-full text-orange-FIDIS pt-[10px] pb-[11px] popup_token_select hover:scale-105',
  select_container: 'border-2 rounded border-orange-FIDIS ',
}

const initialTransactionData: TransactionData = {
  userID: '',
  userWallet: '',
  buySell: '',
  currencySent: '',
  amountSent: '',
  currencyToBeReceived: '',
  amountToBeReceived: '',
  indexNAV: '',
  swapRate: '',
  txHash: '',
}

declare let window: any

const Popup = ({ setPopupOpen, popupOpen, userID }) => {
  const [popupAction, setPopupAction] = useState('Buy')
  const [tokenAmountInput, setTokenAmountInput] = useState('1')
  const [token, setToken] = useState<string>('FI25')
  const ref: any = useRef()

  const chainId = useChainId()
  const tokenData = useTokenBySymbol(chainId, token)
  const ethUsdPrice = useEthUsdPrice()
  const indexData = useIndexPrice(token)

  const [transactionError, setTransactionError] = useState<string>('')
  const [transactionConfirmed, setTransactionConfirmed] =
    useState<boolean>(false)

  const { account } = useMoralis()
  const storeTX = (tx: TransactionData) => {

    const fidis_db1 = Moralis.Object.extend(process.env.NEXT_PUBLIC_MONGO_DB)
    const db1 = new fidis_db1()
    db1
      .save({
        UserID: tx.userID,
        UserWallet: tx.userWallet,
        BuySell: tx.buySell,
        CurrencyTypeSent: tx.currencySent,
        AmountSent: tx.amountSent,
        CurrencyTypeToBeReceived: tx.currencyToBeReceived,
        AmountToBeReceived: tx.amountToBeReceived,
        CryptoIndexNAV: tx.indexNAV,
        SwapRate: tx.swapRate,
        TransactionHash: tx.txHash,
      })
      .then(
        (transaction) => {
          // The object was saved successfully.
          console.log(transaction)
        },
        (error) => {
          // The save failed.
          // error is a Moralis.Error with an error code and message.
          console.log(error)
        }
      )
  }

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      // If the popup is open and the clicked target is not within the popup,
      // then close the popup
      if (popupOpen && ref.current && !ref.current.contains(e.target)) {
        setPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', checkIfClickedOutside)

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [popupOpen])

  // javascript calculation for token
  const dollarsAmount =
    Number(tokenAmountInput) * Number(indexData.price) || 0.0
  const ethAmount = 0.0001 /* dollarsAmount / ethUsdPrice || 0.0*/

  const onChangeToken = (evt: ChangeEvent<HTMLSelectElement>) => {
    setToken(evt.target.value)
  }

  const handleAmountChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setTokenAmountInput(evt.target.value)
  }
  // transfer assets using ethers.js
  // under coding
  const transferAssets = async (buySell: string) => {
    if (!window.ethereum) return

    setTransactionError('')
    setTransactionConfirmed(false)

    // const provider = new Web3Provider(window.ethereum)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const send_address = await signer.getAddress()
    const to_address = process.env.NEXT_PUBLIC_FIDIS_WALLET_ADDRESS

    let tokenSent: string
    let amountSent: string
    let token2beReceived: string
    let amount2beReceived: string

    if (buySell === 'Buy') {
      // transfer native assets (eth)
      tokenSent = 'native'
      amountSent = ethAmount.toFixed(5)
      token2beReceived = token
      amount2beReceived = tokenAmountInput

      const value = ethers.utils.parseUnits(amountSent)
      const tx = {
        // from: send_address,
        to: to_address,
        value: value,
      }

      await signer
        .sendTransaction(tx)
        .then((tr) => {
          console.log(`TransactionResponse TX hash: ${tr.hash}`)
          tr.wait().then((receipt) => {
            // write tx to Moralis database
            const txToStore: TransactionData = {
              userID: userID,
              userWallet: account,
              buySell: buySell,
              currencySent: tokenSent,
              amountSent: amountSent,
              currencyToBeReceived: token2beReceived,
              amountToBeReceived: amount2beReceived,
              indexNAV: Number(indexData.price).toFixed(3),
              swapRate: Number(indexData.swapRate).toFixed(3),
              txHash: tr.hash,
            }
            console.log('tx', txToStore)
            storeTX(txToStore)
            setTransactionConfirmed(true)
          })
        })
        .catch((e: Error) => {
          console.log(e)
          setTransactionError(e.message)
        })
    } else {
      // transfer erc20 tokens
      tokenSent = token
      amountSent = tokenAmountInput
      token2beReceived = 'native'
      amount2beReceived = ethAmount.toFixed(5)

      const erc20 = getERC20Contract(tokenData.address, signer)
      await erc20
        .transfer(
          to_address,
          ethers.utils.parseUnits(amountSent, tokenData.decimals)
        )
        .then((tr) => {
          console.log(`TransactionResponse TX hash: ${tr.hash}`)
          tr.wait().then((receipt) => {
            console.log('transfer receipt', receipt)
            // write tx to Moralis database
            const txToStore: TransactionData = {
              userID: userID,
              userWallet: account,
              buySell: buySell,
              currencySent: tokenSent,
              amountSent: amountSent,
              currencyToBeReceived: token2beReceived,
              amountToBeReceived: amount2beReceived,
              indexNAV: Number(indexData.price).toFixed(3),
              swapRate: Number(indexData.swapRate).toFixed(3),
              txHash: tr.hash,
            }
            console.log('tx', txToStore)
            storeTX(txToStore)
            setTransactionConfirmed(true)
          })
        })
        .catch((e: Error) => {
          console.log(e)
          setTransactionError(e.message)
        })
    }
  }

  const buySellToken = (buySell: string) => {
    // transferAssetsMoralis(buySell)

    transferAssets(buySell)
  }

  return (
    <>
      <Head>
        <title>FIDIS - Buy/Sell</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="sm:block sm:p-0 flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
            aria-hidden="true"
          ></div>

          {/* <!-- This element is to trick the browser into centering the modal contents. --> */}
          <span
            className="sm:inline-block sm:h-screen sm:align-middle hidden"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div
            ref={ref}
            className="popup sm:my-8 sm:align-middle relative inline-block w-[22rem] transform overflow-hidden rounded-lg bg-black text-left align-bottom shadow-xl transition-all"
          >
            <div className="bg-black pb-4 shadow-lg shadow-black">
              <div className="flex w-full">
                {['Buy', 'Sell'].map((btn, index) => (
                  <button
                    key={index}
                    className={`
                    ${styles.buy_sell_buttons} + ${
                      popupAction == btn ? 'bg-orange-FIDIS' : 'bg-transparent'
                    }
                  `}
                    onClick={() => setPopupAction(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-6 px-7 py-4">
                <div
                  className={`${styles.select_container} mt-3 flex items-center`}
                >
                  <input
                    value={tokenAmountInput}
                    onChange={handleAmountChange}
                    type="text"
                    name="token_amount"
                    id="token_amount"
                    className="w-full rounded-l py-3 px-4 text-xl text-white/50"
                  />
                  <select
                    name="token_type"
                    id="token_type"
                    className={styles.popup_token_select}
                    value={token}
                    onChange={onChangeToken}
                  >
                    <option value="FI25">FI25</option>
                    <option value="FI10">FI10</option>
                    <option value="MetaFi">MetaFi</option>
                  </select>
                </div>
                <div className="relative flex">
                  <input
                    type="select"
                    name="dollars_amount"
                    id="dollars_amount"
                    value={dollarsAmount.toFixed(3)}
                    onChange={() => {}}
                    className={styles.popup_input + 'dollar_input rounded-l'}
                  />
                  <span className="absolute top-3 left-32 text-lg text-orange-FIDIS">
                    $
                  </span>
                  <input
                    type="select"
                    name="eth_amount"
                    id="eth_amount"
                    value={ethAmount.toFixed(5)}
                    onChange={() => {}}
                    className={styles.popup_input + 'rounded-r'}
                  />
                  <span className="absolute top-3 right-2 text-lg text-orange-FIDIS">
                    eth
                  </span>
                </div>
                <button
                  className={
                    styles.buy_sell_buttons + 'mt-3 rounded bg-orange-FIDIS'
                  }
                  onClick={() => buySellToken(popupAction)}
                >
                  {popupAction == 'Buy' ? 'Buy' : 'Sell'} Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {transactionError.length !== 0 && (
        <Notification text={transactionError} color="red" />
      )}
      {transactionConfirmed && (
        <Notification text="Transaction successfully mined!" color="green" />
      )}
    </>
  )
}

export default Popup
