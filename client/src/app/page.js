'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Network, Loader2 } from 'lucide-react'
import DNAAnimation from '@/app/components/DnaAnimation'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { HeroSection } from './components'
import { OnBoarding } from './components/OnBoarding'
import { useWalletContext } from '@/context/WalletContext'

// Animated loader component
const Loader = () => (
  <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm'>
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
      Loading your profile data...
    </motion.p>
  </div>
)

export default function Home() {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [showModal, setShowModal] = useState(false)
  const { loading, profileData, fetchProfile } = useWalletContext()

  useEffect(() => {
    if (isConnected && address && !loading) {
      if (profileData && profileData.length > 0) {
        router.push('/home')
      } else {
        setShowModal(true)
      }
    }
  }, [isConnected, address, loading, profileData, router])

  // Handle onboarding completion
  const handleOnboardingComplete = async() => {
    setShowModal(false)
    await fetchProfile()
    router.push('/home')
  }

  return (
    <div className='min-h-screen bg-transparent text-white overflow-x-hidden relative'>
      <DNAAnimation />

      {/* Show loader when wallet is connected and data is loading */}
      {isConnected && loading && <Loader />}

      {/* Logo in top left */}
      {!showModal && (<div className='fixed top-6 left-6 z-40'>
        <motion.div
          className='flex items-center space-x-2 group'
          whileHover={{ scale: 1.05 }}>
          <div className='relative cursor-pointer flex items-center'>
            <Network className='w-8 h-8 text-purple-500 transition-transform group-hover:rotate-180 duration-700' />
            <span className='ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'>
              Conneqt
            </span>
          </div>
        </motion.div>
      </div>)}

      {/* Content with higher z-index */}
      <div className='relative z-10'>
        {/* Show either Onboarding modal or Hero Section */}
        {showModal ? (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-sm  w-full flex justify-center items-center z-50'>
            <OnBoarding onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          <HeroSection isLanding={true} />
        )}
      </div>
    </div>
  )
}
