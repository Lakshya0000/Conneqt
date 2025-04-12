'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Network,
  HeartPulse,
  Shield,
  Lightbulb,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import DNAAnimation from '@/app/components/DnaAnimation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { OnBoarding } from '../components/OnBoarding'

export default function Home() {
  const router = useRouter()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  const { isConnected } = useAccount()
  return (
    <div className='min-h-screen bg-transparent text-white overflow-x-hidden relative'>
      <DNAAnimation />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className='fixed top-0 left-0 w-full bg-black backdrop-blur-md z-50 shadow-lg'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <motion.div
              className='flex items-center space-x-2 group'
              whileHover={{ scale: 1.05 }}>
              <Link href='/'>
                <div className='relative cursor-pointer flex items-center'>
                  <Network className='w-8 h-8 text-purple-500 transition-transform group-hover:rotate-180 duration-700' />
                  <span className='ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'>
                    Conneqt
                  </span>
                </div>
              </Link>
            </motion.div>
            <div className='hidden md:flex space-x-8'>
              <Link href='#how-it-works'>
                <motion className='hover:text-purple-400 transition-colors'>
                  How It Works
                </motion>
              </Link>
              <Link href='#projects'>
                <motion className='hover:text-purple-400 transition-colors'>
                  Projects
                </motion>
              </Link>
              <Link href='#collaboration'>
                <motion className='hover:text-purple-400 transition-colors'>
                  Collaboration
                </motion>
              </Link>
              <div>
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Content wrapper with higher z-index */}
      <div className='z-10 flex w-full h-screen  items-center justify-center'>
        <OnBoarding/>
        {/* Live Projects */}
        {/* <section
          id='projects'
          className='py-20 px-6 '>
          <div className='container mx-auto'>
            <motion.h2
              className='text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              Active Research Projects
            </motion.h2>
            <motion.div
              className='grid md:grid-cols-2 gap-8'
              variants={staggerChildren}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}>
              {[
                {
                  title: 'Novel ALS Treatment Research',
                  image:
                    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800',
                  progress: 76,
                  raised: '2.4M',
                  goal: '3.2M',
                },
                {
                  title: 'Early Cancer Detection AI',
                  image:
                    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800',
                  progress: 45,
                  raised: '1.8M',
                  goal: '4.0M',
                },
              ].map((project, index) => (
                <motion.div
                  key={index}
                  className='group bg-purple-900/20 rounded-2xl overflow-hidden backdrop-blur-lg border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/25'
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}>
                  <div className='relative overflow-hidden'>
                    <motion.img
                      src={project.image}
                      alt={project.title}
                      className='w-full h-48 object-cover'
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a1f] to-transparent opacity-60'></div>
                  </div>
                  <div className='p-6'>
                    <h3 className='text-2xl font-semibold mb-4'>
                      {project.title}
                    </h3>
                    <div className='w-full bg-purple-900/50 rounded-full h-4 mb-4 overflow-hidden'>
                      <motion.div
                        className='bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full'
                        initial={{ width: 0 }}
                        whileInView={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Raised: ${project.raised}</span>
                      <span>Goal: ${project.goal}</span>
                    </div>
                    <motion.button
                      className='mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      Fund This Project
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div> 
          </div>
        </section> */}
      </div>
    </div>
  )
}
