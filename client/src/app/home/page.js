'use client'
import { useRouter } from 'next/navigation'
import { HeroSection } from '../components'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WavyBackground } from '@/components/ui/wavy-background'
import { useWalletContext } from '@/context/WalletContext'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Animated loader component
const Loader = () => (
  <div className='min-h-screen bg-gray-950 flex flex-col items-center justify-center'>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='relative'>
      <div className='h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin'></div>
      <div
        className='absolute top-0 left-0 h-24 w-24 rounded-full border-r-4 border-pink-500 animate-spin'
        style={{ animationDuration: '1s' }}></div>
      <motion.div
        className='absolute inset-0 flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}>
        <Loader2 className='h-8 w-8 text-purple-400 animate-spin' />
      </motion.div>
    </motion.div>
    <motion.p
      className='mt-6 text-purple-400 font-medium'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}>
      Loading your profile...
    </motion.p>
  </div>
)

export default function Home() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { loading, profileData } = useWalletContext()

  useEffect(() => {
    if (loading) return;

    if (!isConnected) {
      router.push('/')
      return;
    }

    if (!profileData || profileData.length === 0) {
      router.push('/')
      return;
    }
    console.log('Profile data Home:', profileData)
  }, [isConnected, loading, router])

  if (loading) {
    return <Loader />
  }

  return (
    <div className='min-h-screen bg-transparent text-white overflow-x-hidden relative'>
      <div className='relative z-10'>
        <WavyBackground
          waveWidth={70}
          waveOpacity={0.2}
          speed='slow'>
          <HeroSection isLanding={false} />
        </WavyBackground>
      </div>
    </div>
  )
}
