'use client'

import React from 'react'
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet'
import { Address, EthBalance, Identity } from '@coinbase/onchainkit/identity'
import { useWalletContext } from '@/context/WalletContext'
import { Loader2, User } from 'lucide-react'
import Image from 'next/image'

const WalletProvider = () => {
  const { profileDetails, loading } = useWalletContext()

  // Check if we have valid profile details with image
  const hasProfileImage =
    profileDetails && profileDetails.image && profileDetails.image.length > 0

  // Check if we have valid profile details with name
  const hasProfileName =
    profileDetails && profileDetails.name && profileDetails.name.length > 0

  // Check if we have valid role information
  const hasRole =
    profileDetails && profileDetails.role && profileDetails.role.length > 0

  // Format role with proper capitalization
  const formattedRole = hasRole
    ? profileDetails.role.charAt(0).toUpperCase() + profileDetails.role.slice(1)
    : ''

  return (
    <Wallet className='flex items-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-purple-500/30 cursor-pointer border border-purple-400/20'>
        <ConnectWallet className='rounded-full bg-transparent flex items-center gap-2.5 pl-1 pr-3 py-1'>
          {hasProfileImage ? (
            // Custom profile image
            <div className='h-8 w-8 rounded-full overflow-hidden border-2 border-white/20 shadow-inner'>
              <Image
                src={profileDetails.image}
                alt={hasProfileName ? profileDetails.name : 'Profile'}
                width={32}
                height={32}
                className='object-cover w-full h-full'
              />
            </div>
          ) : (
            // Default avatar icon
            <div className='h-8 w-8 bg-purple-400/30 rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner'>
              <User className='h-4 w-4 text-white/90' />
            </div>
          )}

          {hasProfileName ? (
            // Custom profile name
            <span className='font-medium text-sm truncate max-w-[120px] text-white/95'>
              {profileDetails.name}
            </span>
          ) : (
            // Default text for no name
            <span className='font-medium text-sm text-white/95'>Wallet</span>
          )}
        </ConnectWallet>
      

      <WalletDropdown>
        <div className='px-6 py-5 flex flex-col items-center bg-gray-900 border-b border-gray-800'>
          {/* Profile Image */}
          {hasProfileImage ? (
            <div className='h-20 w-20 rounded-full overflow-hidden mb-4 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10 ring-2 ring-white/5 ring-offset-1 ring-offset-gray-900'>
              <Image
                src={profileDetails.image}
                alt={hasProfileName ? profileDetails.name : 'Profile'}
                width={80}
                height={80}
                className='object-cover w-full h-full'
              />
            </div>
          ) : (
            <div className='h-20 w-20 bg-purple-400/20 rounded-full flex items-center justify-center mb-4 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10'>
              <User className='h-10 w-10 text-purple-300' />
            </div>
          )}

          {/* Profile Name */}
          {hasProfileName && (
            <span className='font-semibold text-lg mb-1.5 text-white/95 tracking-tight'>
              {profileDetails.name}
            </span>
          )}

          {/* Role tag if available */}
          {hasRole && (
            <span className='bg-purple-500/20 text-purple-200 text-xs font-medium px-3 py-0.5 rounded-full mb-4 border border-purple-500/20 shadow-sm'>
              {formattedRole}
            </span>
          )}

          {/* Address with copy functionality */}
          <Identity
            hasCopyAddressOnClick
            className='flex flex-col items-center'>
            <Address className='text-sm text-purple-300 hover:text-purple-200 transition-colors' />
            <EthBalance className='text-sm font-medium text-purple-300 mt-1.5' />
          </Identity>
        </div>
        <WalletDropdownDisconnect className='hover:bg-red-500/10 hover:text-red-400 transition-colors' />
      </WalletDropdown>
    </Wallet>
  )
}

export default WalletProvider
