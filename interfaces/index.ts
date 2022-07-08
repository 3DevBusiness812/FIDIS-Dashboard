// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

import { string } from "prop-types"

export type User = {
  id: number
  name: string
}

export enum AccountType {
  Personal = 'Personal',
  Business = 'Business',
}

// Account structure which contains informations in Account page.
export interface PersonalAccount {
  firstName: string
  lastName: string
  personalEmail: string
  birthdayYear: number
  birthdayMonth: number
  birthdayDay: number
  nationality: string
  idType: string
  idNumber: string
  idPhoto: string
  houseNo?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface BusinessAccount extends PersonalAccount {
  companyName: string
  ein: string
  companyEmail: string
  companyHouseNo: string
  companyStreet: string
  companyCity: string
  companyState: string
  companyZipCode: string
  companyCountry: string
}

export interface TransactionData {
  userID: string
  userWallet: string
  buySell: string
  currencySent: string
  amountSent: string
  currencyToBeReceived: string
  amountToBeReceived: string
  indexNAV: string
  swapRate: string
  txHash: string
}

export interface DAPSData {
  FI25: {
    price: string
    swapRate: string
  }
  GoldFI: {
    price: string
    swapRate: string
  }
  MetaFI: {
    price: string
    swapRate: string
  }
  NFTFI: {
    price: string
    swapRate: string
  }
  GameFI: {
    price: string
    swapRate: string
  }
  DeFiFI: {
    price: string
    swapRate: string
  }
}

export interface MarketCapItem {
  token_name: string
  token_icon: any
  decimals: number
  balance: number
  balance_in_dollars: number
  change: number
  change_percentage: number
}

export interface MarketCapList {
  FI25: MarketCapItem
  GoldFI: MarketCapItem
  MetaFI: MarketCapItem
  NFTFI: MarketCapItem
  GameFI: MarketCapItem
  DeFiFI: MarketCapItem
}

export interface TokenBalance {
  FI25: number
  GoldFI: number
  MetaFI: number
  NFTFI: number
  GameFI: number
  DeFiFI: number
}

export interface DataTypeOHLC {
  symbol: string
  date: string
  open?: string
  high?: string
  low?: string
  close?: string
  percentChange?: string
}
