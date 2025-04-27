'use client'
import { HeroSection } from '../components'
import { WavyBackground } from '@/components/ui/wavy-background'
import { useWalletContext } from '@/context/WalletContext'
import { motion } from 'framer-motion'
import Loader from '@/components/loader'

// Animated loader component


export default function Home() {
  const { loading } = useWalletContext()

  if (loading){
    return <Loader />
  }
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
