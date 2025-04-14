import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fadeInUp, staggerChildren } from './'
import WalletProvider from '@/components/wallet'

export default function HeroSection({ isLanding }) {
  return(<section className='min-h-screen flex items-center justify-center relative px-6'>
    <motion.div
      className='text-center max-w-4xl mx-auto'
      initial='initial'
      animate='animate'
      variants={staggerChildren}>
      <motion.h1
        className='text-5xl md:text-7xl font-bold mb-6 relative'
        variants={fadeInUp}>
        <motion.span
          className='inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text'
          animate={{ y: [-10, 0, -10] }}
          transition={{ duration: 4, repeat: Infinity }}>
          Decentralized Hope:
        </motion.span>
        <br />
        <motion.span
          className='inline-block bg-gradient-to-r from-white via-gray-300 to-gray-500 text-transparent bg-clip-text'
          animate={{ y: [-10, 0, -10] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}>
          Funding Research, Saving Lives
        </motion.span>
      </motion.h1>
      <motion.p
        className='text-xl text-gray-300 mb-8'
        variants={fadeInUp}>
        Revolutionizing medical research funding through blockchain technology
        and collective action
      </motion.p>
      <motion.div
        className='flex flex-col md:flex-row gap-4 justify-center'
        variants={fadeInUp}>
        {isLanding && (
          // <motion.button
          // className='px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer'
          // whileHover={{ scale: 1.05 }}
          // whileTap={{ scale: 0.95 }}
          // >
         <WalletProvider />
        // </motion.button>
        )}
        <motion.button
          className='px-8 py-4 bg-transparent border-2 border-purple-500 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition-all cursor-pointer'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          Learn More
        </motion.button>
      </motion.div>
    </motion.div>
    {!isLanding && (<motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className='absolute bottom-8 left-1/2 transform -translate-x-1/2'>
      <ChevronDown className='w-8 h-8 text-purple-400' />
    </motion.div>)}
  </section>)
}
