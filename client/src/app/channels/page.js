'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { MessageSquare, ArrowUpRight, Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReadContract, useReadContracts } from 'wagmi'
import { getCompanyConfig, totalCompaniesConfig } from '@/contract/function'
import { toast } from 'sonner'
import { getJsonFromIpfs } from '@/contract'

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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className='h-full'>
      <Card className='overflow-hidden border border-purple-400/20 bg-gray-900/50 backdrop-blur-sm h-full hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/40 transition-all duration-300'>
        <div className='p-6'>
          <div className='flex items-center gap-4 mb-4'>
            {/* Channel Icon */}
            <div className='w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20'>
              {channel.profileIcon ? (
                <Image
                  src={channel.profileIcon}
                  alt={channel.title}
                  width={56}
                  height={56}
                  className='w-full h-full object-cover'
                />
              ) : (
                <Hash className='w-7 h-7 text-white' />
              )}
            </div>

            {/* Channel Name */}
            <div>
              <h3 className='text-xl font-bold text-white'>{channel.title}</h3>
            </div>
          </div>

          {/* Channel Description */}
          <p className='text-gray-300 text-sm mb-6 line-clamp-2'>
            {channel.intro || 'No description available'}
          </p>

          {/* Divider */}
          <div className='h-px w-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mb-4'></div>

          {/* Action Button */}
          <div className='flex justify-end'>
            <Link
              href={`/channels/${channel.id}`}
              className='flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white text-sm font-medium transition-all transform hover:scale-105'>
              Join Channel <ArrowUpRight className='w-4 h-4 ml-1.5' />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const SkeletonCard = () => (
  <div className='rounded-lg overflow-hidden border border-purple-400/10 bg-gray-900/30 h-full p-6'>
    <div className='flex items-center gap-4 mb-4'>
      <div className='w-14 h-14 rounded-full bg-gray-800 animate-pulse'></div>
      <div>
        <div className='h-6 bg-gray-800 animate-pulse rounded w-32'></div>
      </div>
    </div>
    <div className='h-4 bg-gray-800/70 animate-pulse rounded mb-2 w-full'></div>
    <div className='h-4 bg-gray-800/70 animate-pulse rounded mb-6 w-4/5'></div>
    <div className='h-px w-full bg-gray-800/50 animate-pulse mb-4'></div>
    <div className='flex justify-end'>
      <div className='h-10 w-32 bg-gray-800 animate-pulse rounded-full'></div>
    </div>
  </div>
)

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
  const [configs, setConfigs] = useState([])
  // Fetch channels data
  const {data : totalCompanies} = useReadContract({...totalCompaniesConfig})
  const getCompanyConfigs = () => {
    if(!totalCompanies) return [];
    const companyConfigs = []
    for(let i=1;i<=Number(totalCompanies);i++){
      companyConfigs.push({
        ...getCompanyConfig,args:[i]
      })
    }
    return companyConfigs;
  }
  useEffect(()=>{
    if(totalCompanies && Number(totalCompanies) > 0){
      const companyConfigs = getCompanyConfigs()
      // console.log("companyConfigs : ",companyConfigs)
      setConfigs(companyConfigs)
    }
    // console.log("totalCompanies : ",totalCompanies)
  },[totalCompanies])
  const {data: channelsData,isLoading:channelsLoading,isError : companiesError} = useReadContracts({
    contracts: configs
  })
  useEffect(()=>{
    if(channelsLoading) return setIsLoading(true);
    if(companiesError){
      toast.error("Error fetching channels data")
      setIsLoading(false)
    }
    if(channelsData && channelsData.length > 0){
      const processChannels = async () => {
        const channelsRes = channelsData.map(async(channel)=>{
          // console.log("channel : ",channel)
            const channelData = await getJsonFromIpfs(channel.result[1]);
            return {...channelData, id: (Number(channel.result[0])), uri: channel.result[1]};
        })
        setChannels(await Promise.all(channelsRes))
      }
      processChannels()
      setIsLoading(false)
    }
    // console.log("test : ",channelsData)
  },[channelsData,channelsLoading,companiesError])
  
  return (
    <div className='mt-20 min-h-screen bg-gray-950'>
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
            <button className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105'>
              Create Channel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
