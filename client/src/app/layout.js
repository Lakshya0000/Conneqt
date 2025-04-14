'use client'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { mainnet, sepolia, baseSepolia, base } from 'wagmi/chains'
import { Provider } from '@/components/provider'
import '@coinbase/onchainkit/styles.css'; 
import Navbar from './components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const config = createConfig({
  chains: [baseSepolia, sepolia],
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Navbar/>
            <Provider>{children}</Provider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
