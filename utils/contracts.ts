import { Signer } from '@ethersproject/abstract-signer'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { Provider, Web3Provider } from '@ethersproject/providers'
import ERC20Abi from '../config/erc20.json'
import { JsonRpcProvider } from '@ethersproject/providers'

export const getContract = (
  address: string,
  abi: ContractInterface,
  signer?: Signer | Provider
) => {
  const signerOrProvider =
    signer ?? new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
  return new Contract(address, abi, signerOrProvider)
}

export const getERC20Contract = (
  address: string,
  signer?: Signer | Provider
) => {
  return getContract(address, ERC20Abi, signer)
}
