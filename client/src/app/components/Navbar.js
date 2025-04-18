import React from 'react';
import { motion } from 'framer-motion'
import Link from 'next/link'

import WalletProvider from '@/components/wallet';
import { Network } from 'lucide-react';

const Navbar = () => {
  
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
                          <Link href='/'>
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
                          <Link href='/research'>
                            <button className='px-4 py-2 bg-purple-600 hover:bg-purple-700 transition duration-200 rounded-lg text-white'>
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
