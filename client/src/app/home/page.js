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
  <div className='min-h-screen bg-gradient-to-b from-gray-950 to-black flex flex-col items-center justify-center'>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='relative group'>
      <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500'></div>
      <div className='h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin'></div>
      <div
        className='absolute top-0 left-0 h-24 w-24 rounded-full border-r-4 border-pink-500 animate-spin'
        style={{ animationDuration: '1.5s' }}></div>
      <motion.div
        className='absolute inset-0 flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}>
        <Loader2 className='h-8 w-8 text-purple-400 animate-spin' />
      </motion.div>
    </motion.div>
    <motion.p
      className='mt-8 text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium'
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
  }, [isConnected, router])

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-950 to-black text-white overflow-x-hidden relative'>
      {/* Background Patterns */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3B0764,transparent)]'></div>
      <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]'></div>

      <div className='relative z-10'>
        <WavyBackground
          waveWidth={100}
          waveOpacity={0.15}
          speed='slow'
          blur={20}
          colors={['#581C87', '#7E22CE', '#A855F7', '#D946EF']}
          className='w-full'
          containerClassName='min-h-screen'
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection isLanding={false} />
          </motion.div>
        </WavyBackground>
      </div>
    </div>
  )
}
