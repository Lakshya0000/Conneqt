import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fadeInUp, staggerChildren } from './'
import WalletProvider from '@/components/wallet'

export default function HeroSection({ isLanding }) {
  return (
    <section className='min-h-screen flex items-center justify-center relative px-6 py-24'>
      <motion.div
        className='text-center max-w-5xl mx-auto'
        initial='initial'
        animate='animate'
        variants={staggerChildren}>
        <motion.h1
          className='text-6xl md:text-8xl font-bold mb-8 relative tracking-tight'
          variants={fadeInUp}>
          <motion.span
            className='inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text drop-shadow-2xl'
            animate={{ y: [-10, 0, -10] }}
            transition={{ duration: 4, repeat: Infinity }}>
            Decentralized Hope:
          </motion.span>
          <br />
          <motion.span
            className='inline-block bg-gradient-to-b from-white via-gray-300 to-gray-500 text-transparent bg-clip-text'
            animate={{ y: [-10, 0, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}>
            Funding Research,
          </motion.span>
          <br />
          <motion.span
            className='inline-block bg-gradient-to-b from-gray-300 via-gray-500 to-gray-700 text-transparent bg-clip-text'
            animate={{ y: [-10, 0, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
            Saving Lives
          </motion.span>
        </motion.h1>
        <motion.p
          className='text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed'
          variants={fadeInUp}>
          Revolutionizing medical research funding through blockchain technology
          and collective action
        </motion.p>
        <motion.div
          className='flex flex-col md:flex-row gap-6 justify-center items-center'
          variants={fadeInUp}>
          {isLanding ? (
            <WalletProvider />
          ) : (
            <motion.button
              className='group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-lg font-semibold 
                       hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 
                       hover:shadow-xl hover:shadow-purple-500/20'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              Learn More
              <span className='ml-2 inline-block transition-transform group-hover:translate-x-1'>
                →
              </span>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
      {!isLanding && (
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className='absolute bottom-12 left-1/2 transform -translate-x-1/2'>
          <ChevronDown className='w-8 h-8 text-purple-400 animate-bounce' />
        </motion.div>
      )}
    </section>
  );
}
