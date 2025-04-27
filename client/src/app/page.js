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

// Animated loader component - use client side only rendering
const Loader = () => {
  // Use state to ensure this only renders on client side
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render the loader after component has mounted on client
  if (!isMounted) return null

  return (
    <div className='fixed inset-0 z-50 bg-gradient-to-b from-gray-950 to-black flex flex-col items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='relative group z-10'>
        {/* Glow effect */}
        <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity' />

        {/* Spinning rings */}
        <div className='h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin' />
        <div
          className='absolute top-0 left-0 h-24 w-24 rounded-full border-r-4 border-pink-500 animate-spin'
          style={{ animationDuration: '1.5s' }}
        />

        {/* Center icon */}
        <motion.div
          className='absolute inset-0 flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          <Loader2 className='h-8 w-8 text-purple-400 animate-spin' />
        </motion.div>
      </motion.div>

      <motion.p
        className='mt-8 text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium relative z-10'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>
        Loading your profile data...
      </motion.p>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [showModal, setShowModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { loading, profileData, fetchProfile } = useWalletContext()

  // Use effect to mark when client-side rendering is active
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isConnected && address && !loading && isClient) {
      if (profileData && profileData.length > 0) {
        // User has a profile, redirect to home
        router.push('/home')
      } else {
        // User doesn't have a profile, show onboarding
        setShowModal(true)
      }
    }
  }, [isConnected, address, profileData, router, isClient])

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    setShowModal(false)
    await fetchProfile()
    router.push('/home')
  }

  return (
    <div className='min-h-screen bg-gray-950 text-white overflow-x-hidden relative'>
      {/* Background gradients */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_600px_at_80%_40%,#4C0B7A,transparent)]' />

      <DNAAnimation />

      {/* Only show loader when on client side to prevent hydration mismatch */}
      {isClient && isConnected && loading && <Loader />}

      {/* Logo in top left with enhanced animation - only render on client side when needed */}
      {isClient && !showModal && (
        <div className='fixed top-6 left-6 z-40'>
          <motion.div
            className='flex items-center space-x-2 group'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <div className='relative cursor-pointer flex items-center'>
              <Network
                className='w-8 h-8 text-purple-500 transition-all duration-700 
                              group-hover:rotate-180 group-hover:text-purple-400'
              />
              <span
                className='ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 
                           bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-500'>
                Conneqt
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content with enhanced modal backdrop */}
      <div className='relative z-10'>
        {isClient && showModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/90 backdrop-blur-xl w-full flex justify-center items-center z-50'>
            <OnBoarding onComplete={handleOnboardingComplete} />
          </motion.div>
        ) : (
          <HeroSection isLanding={true} />
        )}
      </div>
    </div>
  )
}
