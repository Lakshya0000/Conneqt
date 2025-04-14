"use client"

import React from 'react'
import {
  Wallet,
  ConnectWallet,
  WalletDropdown, 
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet'
import { Avatar, Name, Address, Identity, EthBalance} from '@coinbase/onchainkit/identity'
const WalletProvider = () => {
  return (
    <Wallet className='flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:bg-gradient-to-l hover:from-purple-700 hover:to-pink-700 transition-all transform hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer'>
      <ConnectWallet className='rounded-full  bg-transparent '>
        <Avatar />
        <Name />  
      </ConnectWallet>
      <WalletDropdown >
        <Identity
          className='px-4 pt-3 pb-2'
          hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  )
}

export default WalletProvider
