'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { MessageSquare, ArrowUpRight, Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { useConfig} from 'wagmi'
import { getCompanyConfig, totalCompaniesConfig } from '@/contract/function'
import { toast } from 'sonner'
import { getJsonFromIpfs } from '@/contract'
import { readContract, readContracts } from 'wagmi/actions'
import { useWalletContext } from '@/context/WalletContext'
import Loader from '@/components/loader'

const staggerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const ChannelCard = ({ channel }) => {
  return (
    <motion.div
      variants={itemAnimation}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full group"
    >
      <Card className="overflow-hidden border border-purple-400/20 bg-gradient-to-b from-gray-900/90 to-gray-950/90 
                     backdrop-blur-sm h-full relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors duration-500" />

        <div className="relative p-6 space-y-6">
          {/* Channel Header */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7 }}
              className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 
                        flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20 border-2 border-transparent 
                        group-hover:border-purple-400/50 transition-all duration-300"
            >
              {channel.profileIcon ? (
                <Image
                  src={channel.profileIcon}
                  alt={channel.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Hash className="w-7 h-7 text-white" />
              )}
            </motion.div>

            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent 
                           group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                {channel.title}
              </h3>
            </div>
          </div>

          {/* Channel Description */}
          <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-200 transition-colors">
            {channel.intro || 'No description available'}
          </p>

          {/* Divider with Animation */}
          <div className="relative h-px w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Link href={`/channels/${channel.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700 rounded-full text-white text-sm font-medium 
                         shadow-lg shadow-purple-500/20 transition-all duration-300 group/button"
              >
                Join Channel
                <ArrowUpRight className="w-4 h-4 ml-1.5 transform group-hover/button:translate-x-0.5 
                                     group-hover/button:-translate-y-0.5 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}


const LoadingState = () => (
  <div className='flex flex-col items-center justify-center py-12'>
    <div className='relative w-16 h-16 mb-4'>
      <div className='absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin'></div>
      <div
        className='absolute inset-2 rounded-full border-t-2 border-pink-500 border-opacity-70 animate-spin'
        style={{
          animationDirection: 'reverse',
          animationDuration: '1.5s',
        }}></div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <MessageSquare className='w-6 h-6 text-purple-400' />
      </div>
    </div>
    <p className='text-gray-300 font-medium'>Loading channels...</p>
  </div>
)

const Page = () => {
  const [channels, setChannels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const config = useConfig();
  const {loading : profileLoading, profileData} = useWalletContext();
  const getCompanyConfigs = (totalCompanies) => {
    if (!totalCompanies) return [];
    const companyConfigs = []
    for (let i = 1; i <= Number(totalCompanies); i++) {
      companyConfigs.push({
        ...getCompanyConfig, args: [i]
      })
    }
    return companyConfigs;
  }
  const fetchCompanies = async () => {
    setIsLoading(true)
    try{
      console.log("Fetching companies...")
      const totalCompanies = await readContract(config, {
        ...totalCompaniesConfig
      })
      const companyConfigs = getCompanyConfigs(totalCompanies)
      const companies = await readContracts(config, {
        contracts: companyConfigs
      })
      console.log("Companies: ", companies)
      const channelsRes = await Promise.all(
        companies.map(async (data)=>{
          const channel = data.result;
          const channelData = await getJsonFromIpfs(channel[1]);
          return { ...channelData, id: (Number(channel[0])), uri: channel[1] };
        })
      )
      console.log("Channels: ", channelsRes)
      setChannels(channelsRes)
      setIsLoading(false)
    }
    catch(e){
      toast.error("Error fetching channels data")
      setChannels([])
      setIsLoading(false)
    }
  }
  useEffect(()=>{
    if(!profileLoading && profileData && profileData.length > 0){
      fetchCompanies()
    }
  },[profileData])
  if(profileLoading){
    return <Loader />
  }
  return (
    <div className='mt-10 min-h-screen bg-gray-950'>
      <div className='max-w-7xl mx-auto px-6 py-20'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4'>
            Research Channels
          </h1>
          <p className='text-gray-300 max-w-2xl mx-auto'>
            Join collaborative channels to discuss research, share ideas, and
            connect with professionals working on groundbreaking medical
            innovations.
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : channels.length > 0 ? (
          <motion.div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            variants={staggerAnimation}
            initial='hidden'
            animate='show'>
            {channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
              />
            ))}
          </motion.div>
        ) : (
          <div className='text-center bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 py-16'>
            <MessageSquare className='w-16 h-16 text-gray-500 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-300 mb-2'>
              No channels found
            </h3>
            <p className='text-gray-400 mb-6'>
              Be the first to create a channel and start the conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
