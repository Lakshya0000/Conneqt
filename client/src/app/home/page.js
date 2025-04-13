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
import { DNAAnimation, HeroSection } from '../components'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { OnBoarding } from '../components/OnBoarding'
import { staggerChildren, fadeInUp } from '../components'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation'
import { WavyBackground } from '@/components/ui/wavy-background'
import Carousel from '@/components/ui/carousel'
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials'
import { Vortex } from '@/components/ui/vortex'
import WalletProvider from '@/components/wallet'

export default function Home() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const { isConnected } = useAccount()
  const slideData = [
    {
      title: 'Mystic Mountains',
      button: 'Explore Component',
      src: 'https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Urban Dreams',
      button: 'Explore Component',
      src: 'https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Neon Nights',
      button: 'Explore Component',
      src: 'https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Desert Whispers',
      button: 'Explore Component',
      src: 'https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ]
  const testimonials = [
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: 'Sarah Chen',
      designation: 'Product Manager at TechFlow',
      src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: 'Michael Rodriguez',
      designation: 'CTO at InnovateSphere',
      src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: 'Emily Watson',
      designation: 'Operations Director at CloudScale',
      src: 'https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: 'James Kim',
      designation: 'Engineering Lead at DataPro',
      src: 'https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      quote:
        'The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.',
      name: 'Lisa Thompson',
      designation: 'VP of Technology at FutureNet',
      src: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ]
  return (
    <div className='min-h-screen bg-transparent text-white overflow-x-hidden relative'>
      {/* <DNAAnimation /> */}

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
            <div className='md:flex space-x-8'>
              <Link href='#how-it-works'>
                <span className='hover:text-purple-400 transition-colors'>
                  How It Works
                </span>
              </Link>
              <Link href='#projects'>
                <span className='hover:text-purple-400 transition-colors'>
                  Projects
                </span>
              </Link>
              <Link href='#collaboration'>
                <span className='hover:text-purple-400 transition-colors'>
                  Collaboration
                </span>
              </Link>
              <div>
                <WalletProvider />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Content wrapper with higher z-index */}
      {!submitted && (
        <div className=' flex flex-col w-full h-screen items-center justify-center'>
          <OnBoarding />
        </div>
      )}
      {submitted && (
        <div className='relative z-10'>
          <WavyBackground
            waveWidth={70}
            waveOpacity={0.2}
            speed='slow'>
            <HeroSection isLanding={false} />
          </WavyBackground>
          {/* Card Part 1 */}
          <div className='min-h-screen flex flex-col items-center gap-y-4 justify-center bg-black'>
            <h1 className='text-center text-5xl text-white'>Cards Part 1</h1>
            <Carousel slides={slideData} />
          </div>
          {/* Card Part 2 */}
          <div className='min-h-screen flex flex-col items-center gap-y-4 justify-center bg-black'>
            <h1 className='text-center text-5xl text-white'>Cards Part 1</h1>
            <AnimatedTestimonials testimonials={testimonials} />
          </div>
          {/* Card Part 3
          <div className='min-h-screen flex flex-col items-center gap-y-4 justify-center'>
            <h1 className='text-center text-5xl text-white'>Cards Part 1</h1>
            <AnimatedTestimonials testimonials={testimonials}/>
          </div> */}
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
          <div className='w-full rounded-md  h-screen overflow-hidden'>
            <Vortex
              backgroundColor='black'
              rangeY={800}
              particleCount={1200}
              baseHue={120}
              className='flex items-center flex-col justify-center px-2 md:px-10  py-4 w-full h-full'>
              <h2 className='text-white text-2xl md:text-6xl font-bold text-center'>
                The hell is this?
              </h2>
              <p className='text-white text-sm md:text-2xl max-w-xl mt-6 text-center'>
                This is chemical burn. It&apos;ll hurt more than you&apos;ve
                ever been burned and you&apos;ll have a scar.
              </p>
              <div className='flex flex-col sm:flex-row items-center gap-4 mt-6'>
                <button className='px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]'>
                  Order now
                </button>
                <button className='px-4 py-2  text-white '>
                  Watch trailer
                </button>
              </div>
            </Vortex>
          </div>
        </div>
      )}
    </div>
  )
}
