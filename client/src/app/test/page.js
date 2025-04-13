"use client"
import React from 'react'
import {Avatar, Name} from '@coinbase/onchainkit/identity'
import { base } from 'viem/chains'
const page = () => {
  const address = '0x2F55f5Aeb94A8b8E59E317D47754582bc16701fB'
  return <div>
    <Avatar address={address} chain={base} />
    <Name address={address} chain={base}  />
  </div>
}

export default page
