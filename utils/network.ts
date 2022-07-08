import Moralis from 'moralis'

export const switchNetwork = async (
  requestChainId: string,
  currentChainId: string
) => {
  if (requestChainId !== currentChainId) {
    // switch network
    await Moralis.switchNetwork(requestChainId)
      .then(() => true)
      .catch(async (switchError: any) => {
        if (switchError.code === 4902) {
          // if failed with error code 4902, add network
          await Moralis.addNetwork(
            requestChainId,
            process.env.NEXT_PUBLIC_CHAIN_NAME!,
            process.env.NEXT_PUBLIC_NATIVE_CURRENCY_NAME!,
            process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL!,
            process.env.NEXT_PUBLIC_RPC_URL!,
            process.env.NEXT_PUBLIC_BLOCKSCAN_URL!
          )
        }
      })
  }
}
