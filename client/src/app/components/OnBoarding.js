'use client'

import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { MessageCircle, User, Upload, UserRound, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { createProfileConfig, getProfileConfig } from '@/contract/function'
import { toast } from 'sonner'

export function OnBoarding() {
  // State management
  const [messages, setMessages] = useState([])
  const [currentStep, setCurrentStep] = useState('name')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    imageUrl: '',
    role: null,
  })

  // References
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Wagmi hooks
  const { address } = useAccount()
  const { writeContractAsync, isPending: isMinting } = useWriteContract()
  const { data: profileData, isLoading: isProfileLoading } = useReadContract({
    ...getProfileConfig,
    args: [address],
    enabled: !!address,
  })

  // Check if user already has a profile
  useEffect(() => {
    if (profileData && !isProfileLoading) {
      toast.info('You already have a profile! Redirecting to dashboard...')

    }
    console.log('Profile data:', profileData);
  }, [profileData, isProfileLoading])

  // Initial message
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "Hi there! I'm your onboarding assistant. What's your name?"
        )
      }, 500)
    }
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Helper to add a bot message with typing animation
  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: '',
        sender: 'ai',
        isTyping: true,
      },
    ])

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isTyping)
          .concat({
            id: Date.now(),
            text,
            sender: 'ai',
          })
      )
    }, delay)
  }

  // Helper to add a user message
  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: 'user',
      },
    ])
  }

  // Handle name submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    if (currentStep === 'name') {
      const nameValue = input.trim()
      addUserMessage(nameValue)
      setUserData((prev) => ({ ...prev, name: nameValue }))
      setInput('')

      setTimeout(() => {
        addBotMessage(
          `Nice to meet you, ${nameValue}! Please upload a profile picture.`
        )
        setCurrentStep('image')
      }, 500)
    }
  }

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)

      // Create FormData for Pinata
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pinataMetadata', JSON.stringify({ name: file.name }))

      // Upload to Pinata
      const res = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          pinata_api_key: '35cb1bf7be19d2a8fa0d',
          pinata_secret_api_key:
            '2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50',
          'Content-Type': 'multipart/form-data',
        },
      })

      // Set image URL
      const imageUrl = `https://ipfs.io/ipfs/${res.data.IpfsHash}`
      setUserData((prev) => ({ ...prev, imageUrl }))

      // Add success message
      addUserMessage('Image uploaded successfully!')
      setTimeout(() => {
        addBotMessage('Great photo! What role do you identify with?')
        setCurrentStep('role')
      }, 500)
    } catch (error) {
      toast.error('Image upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle role selection
  const handleRoleSelect = (role) => {
    setUserData((prev) => ({ ...prev, role }))

    const roleText = role.charAt(0).toUpperCase() + role.slice(1)
    addUserMessage(`I'm a ${roleText}`)

    setTimeout(() => {
      addBotMessage(
        `Thank you! You've been registered as a ${roleText}. Click 'Complete Onboarding' to finish.`
      )
      setCurrentStep('complete')
    }, 500)
  }

  // Mint profile on blockchain
  const mintProfile = async () => {
    try {
      setLoading(true)

      // Prepare metadata
      const metadata = JSON.stringify({
        name: userData.name,
        imageUrl: userData.imageUrl,
        role: userData.role,
      })

      // Upload metadata to IPFS
      const res = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data: metadata,
        headers: {
          pinata_api_key: '35cb1bf7be19d2a8fa0d',
          pinata_secret_api_key:
            '2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50',
          'Content-Type': 'application/json',
        },
      })

      // Get IPFS URI for metadata
      const profileURI = `https://ipfs.io/ipfs/${res.data.IpfsHash}`

      // Mint profile on blockchain
      await writeContractAsync({
        ...createProfileConfig,
        args: [profileURI],
      })

      toast.success('Profile created successfully!')
      addBotMessage(
        'Your profile has been created on the blockchain. Welcome to Conneqt!'
      )

      // Redirect to dashboard after successful minting
      // router.push('/dashboard')
    } catch (error) {
      toast.error('Profile creation failed. Please try again.')
      console.error('Minting error:', error)
    } finally {
      setLoading(false)
    }
  }

  // UI Components for different steps
  const renderInputSection = () => {
    switch (currentStep) {
      case 'name':
        return (
          <form
            onSubmit={handleSubmit}
            className='flex gap-3'>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Enter your name...'
              className='flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
              disabled={isTyping}
              autoFocus
            />
            <Button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700'
              disabled={isTyping || !input.trim()}>
              Send
            </Button>
          </form>
        )

      case 'image':
        return (
          <div className='flex flex-col gap-4'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
            />
            <div className='flex items-center justify-center gap-4'>
              {userData.imageUrl ? (
                <div className='relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400'>
                  <Image
                    src={userData.imageUrl}
                    alt='Profile preview'
                    fill
                    className='object-cover'
                  />
                </div>
              ) : null}

              <Button
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700'
                disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4' />
                    <span>
                      {userData.imageUrl
                        ? 'Change Image'
                        : 'Upload Profile Picture'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 'role':
        return (
          <div className='grid grid-cols-3 gap-4'>
            {['doctor', 'client', 'researcher'].map((role) => (
              <Button
                key={role}
                onClick={() => handleRoleSelect(role)}
                variant='outline'
                className='flex flex-col items-center gap-2 p-4 h-auto border-purple-400/50 text-purple-400 hover:bg-purple-400/10'>
                <UserRound className='h-8 w-8 text-purple-400' />
                <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </Button>
            ))}
          </div>
        )

      case 'complete':
        return (
          <div className='flex justify-center'>
            <Button
              onClick={mintProfile}
              className='px-8 bg-purple-600 hover:bg-purple-700'
              disabled={loading || isMinting}>
              {loading || isMinting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <span>Complete Onboarding</span>
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className='flex flex-col mt-20 h-[700px] shadow-xl rounded-xl overflow-hidden border border-purple-400/30 bg-gray-900 w-[1200px]'>
      {/* Header */}
      <div className='bg-gray-800 p-4 text-purple-400 flex items-center gap-2 border-b border-purple-400/20'>
        <MessageCircle className='h-5 w-5' />
        <h2 className='font-semibold'>Onboarding Assistant</h2>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-6 bg-gray-900 space-y-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'ai' ? 'justify-start' : 'justify-end'
            }`}>
            <div
              className={`flex items-start gap-3 max-w-[80%] ${
                message.sender === 'ai' ? 'flex-row' : 'flex-row-reverse'
              }`}>
              <div className='flex-shrink-0 mt-1'>
                {message.sender === 'ai' ? (
                  <div className='bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center'>
                    <MessageCircle className='h-4 w-4' />
                  </div>
                ) : (
                  <Avatar className='w-8 h-8 bg-slate-300'>
                    <User className='h-4 w-4' />
                  </Avatar>
                )}
              </div>
              <div
                className={`rounded-lg p-4 ${
                  message.sender === 'ai'
                    ? 'bg-gray-800 text-gray-100'
                    : 'bg-purple-600 text-white'
                }`}>
                {message.isTyping ? (
                  <div className='flex space-x-1 items-center h-6'>
                    <div
                      className='w-2 h-2 rounded-full bg-purple-400 animate-bounce'
                      style={{ animationDelay: '0ms' }}></div>
                    <div
                      className='w-2 h-2 rounded-full bg-purple-400 animate-bounce'
                      style={{ animationDelay: '150ms' }}></div>
                    <div
                      className='w-2 h-2 rounded-full bg-purple-400 animate-bounce'
                      style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='p-6 border-t border-purple-400/20 bg-gray-800'>
        {renderInputSection()}
      </div>
    </Card>
  )
}
