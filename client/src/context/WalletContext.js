import { getJsonFromIpfs } from '@/contract'
import { getProfileConfig } from '@/contract/function'
import { createContext, useContext, useEffect, useState } from 'react'
import { idchain } from 'viem/chains'
import { useAccount, useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

const channelContext = createContext(null)

export function ChannelProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState([])
  const [profileDetails, setProfileDetails] = useState({})
  const { address, isConnected } = useAccount()
  const config = useConfig()
  const fetchProfile = async () => {
    try {
        setLoading(true)
      if (!address || !isConnected) {
        setProfileData([])
        return
      }
      const profile = await readContract(config, {
        ...getProfileConfig,
        args: [address],
      })
      console.log(profile)
      if(profile && profile.length > 0){
        const obj = await getJsonFromIpfs(profile[1]);
        if(obj){
            setProfileDetails({...obj, id: Number(profile[0])})
        }
      }
      setProfileData(profile)
      setLoading(false)
    } catch (e) {
      console.log('Error fetching profile: ', e)
      setLoading(false)
    }
  }
  useEffect(() => {
    if(config && address){
        console.log("Fetching profile...")
        console.log("Address : ",address)
        console.log("Config : ",config)
        fetchProfile()
    }
  }, [config,address, isConnected])
  return (
    <channelContext.Provider value={{ profileData, fetchProfile, loading, profileDetails }}>
      {children}
    </channelContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(channelContext)
  if (!context) {
    throw new Error('useWalletContext must be used within a ChannelProvider')
  }
  return context
}
