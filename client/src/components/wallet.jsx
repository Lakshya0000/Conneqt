"use client"

import React from 'react'
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet'
import { Avatar, Name, Address, Identity, EthBalance } from '@coinbase/onchainkit/identity'
const WalletProvider = () => {
  return (
    <Wallet className='bg-blue-400'>
      <ConnectWallet className='bg-blue-400'>
        <Avatar />
        <Name />
      </ConnectWallet>
      <WalletDropdown>
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
