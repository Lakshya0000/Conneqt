import React, { useEffect } from 'react';
import { motion } from 'framer-motion'
import Link from 'next/link'

import WalletProvider from '@/components/wallet';
import { Network } from 'lucide-react';
import { useWalletContext } from '@/context/WalletContext';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Navbar = () => {
    const { address, isConnected } = useAccount()
    const router = useRouter()
    const {profileData, loading} = useWalletContext()
    useEffect(() => {
        if (loading) return;
        if (!isConnected) {
          toast.info('Please connect your wallet to access the app.')
          router.push('/')
          return;
        }
        if (!profileData || profileData.length === 0) {
          router.push('/')
          return;
        }
        console.log('Profile data Home:', profileData)
      }, [isConnected, router, address, profileData])
    return (
        <div>
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
                          <Link href={profileData ? '/home' : '/'}>
                            <div className='relative cursor-pointer flex items-center'>
                              <Network className='w-8 h-8 text-purple-500 transition-transform group-hover:rotate-180 duration-700' />
                              <span className='ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'>
                                Conneqt
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                        <div className='md:flex space-x-8 items-center'>
                          <Link href={"/channels"}>
                            <span className='hover:text-purple-400 transition-colors'>
                              Channels
                            </span>
                          </Link>
                          <Link href='/projects'>
                            <span className='hover:text-purple-400 transition-colors'>
                              Projects
                            </span>
                          </Link>
                          <Link href='/research'>
                            <button className='hover:text-purple-400 transition-colors'>
                              Fund Research
                            </button>
                          </Link>
                          <div>
                            <WalletProvider />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.nav>
            
        </div>
    );
}

export default Navbar;
