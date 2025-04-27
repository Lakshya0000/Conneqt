'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
  MessageCircle,
  User,
  Upload,
  UserRound,
  Loader2,
  Pencil,
  Check,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { uploadToIpfs, uploadToIpfsJson } from '@/contract'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions'
import { createProfileConfig } from '@/contract/function'
import { useConfig } from 'wagmi'

export function OnBoarding({ onComplete }) {
  // State management with unique initial message ID
  const [messages, setMessages] = useState([
    {
      id: `ai-initial-${Date.now()}`,
      text: "Hi there! I'm your onboarding assistant. What's your name?",
      sender: 'ai',
    },
  ])
  const [currentStep, setCurrentStep] = useState('name')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    imageUrl: '',
    role: null,
  })
  const [showEditModal, setShowEditModal] = useState(false)
  // Counter to generate unique IDs
  const messageIdCounter = useRef(1)
  const config = useConfig()
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Helper to generate unique IDs
  const generateUniqueId = (prefix) => {
    messageIdCounter.current += 1
    return `${prefix}-${Date.now()}-${messageIdCounter.current}`
  }

  // Helper to add a bot message with typing animation
  const addBotMessage = (text) => {
    setIsTyping(true)

    const typingId = generateUniqueId('ai-typing')
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        text: '',
        sender: 'ai',
        isTyping: true,
      },
    ])

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                id: generateUniqueId('ai'), // Generate new ID for completed message
                text,
                sender: 'ai',
                isTyping: false,
              }
            : msg
        )
      )
    }, 500)
  }

  // Helper to add a user message
  const addUserMessage = (text, imageUrl = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId('user'),
        text,
        sender: 'user',
        imageUrl,
      },
    ])
  }

  // Handle name submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    if (currentStep === 'name') {
      const nameValue = input.trim()
      addUserMessage(nameValue)
      setUserData((prev) => ({ ...prev, name: nameValue }))
      setInput('')

      addBotMessage(
        `Nice to meet you, ${nameValue}! Please upload a profile picture.`
      )
      setCurrentStep('image')
    }
  }

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const imageUrl = await uploadToIpfs(file)
      setUserData((prev) => ({ ...prev, imageUrl }))

      // Only show preview, don't advance to next step yet
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Image upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalImageSubmission = () => {
    if (userData.imageUrl) {
      // Add user confirmation message with their chosen image
      addUserMessage("I'm happy with this profile picture", userData.imageUrl)

      // Bot response moves to next step
      addBotMessage('Great photo! What role do you identify with?')
      setCurrentStep('role')
    } else {
      toast.error('Please upload an image first')
    }
  }

  // Handle role selection
  const handleRoleSelect = (role) => {
    setUserData((prev) => ({ ...prev, role }))
    const roleText = role.charAt(0).toUpperCase() + role.slice(1)
    addUserMessage(`I'm a ${roleText}`)

    addBotMessage(
      <>
        <p>Thank you! Your profile is now ready:</p>
        <div className='mt-2 p-3 bg-gray-700 rounded-lg'>
          <div className='flex items-center gap-3'>
            {userData.imageUrl && (
              <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                <Image
                  src={userData.imageUrl}
                  alt={userData.name}
                  width={40}
                  height={40}
                  className='object-cover w-full h-full'
                />
              </div>
            )}
            <div>
              <p className='font-medium'>{userData.name}</p>
              <p className='text-sm text-gray-300'>{roleText}</p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='mt-2 text-purple-400 hover:text-purple-300 p-0'
            onClick={() => setShowEditModal(true)}>
            <Pencil className='h-3 w-3 mr-1' />
            Edit Profile
          </Button>
        </div>
        <p className='mt-2'>
          {"Everything looks good? Click 'Continue to Dashboard' to proceed."}
        </p>
      </>
    )
    setCurrentStep('complete')
  }

  const handleEditProfile = () => {
    addBotMessage(
      <>
        <p>Your profile has been updated:</p>
        <div className='mt-2 p-3 bg-gray-700 rounded-lg'>
          <div className='flex items-center gap-3'>
            {userData.imageUrl && (
              <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                <Image
                  src={userData.imageUrl}
                  alt={userData.name}
                  width={40}
                  height={40}
                  className='object-cover w-full h-full'
                />
              </div>
            )}
            <div>
              <p className='font-medium'>{userData.name}</p>
              <p className='text-sm text-gray-300'>
                {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
              </p>
            </div>
          </div>
        </div>
        <p className='mt-2'>{"Click 'Continue to Dashboard' to proceed."}</p>
      </>
    )
    setShowEditModal(false)
  }

  const handleCompletionClick = async () => {
    setLoading(true)
    setTimeout(async () => {
      try {
        const { name, imageUrl, role } = userData
        const ipfsUri = await uploadToIpfsJson({
          name,
          image: imageUrl,
          role,
        })
        const txr = await writeContract(config, {
          ...createProfileConfig,
          args: [ipfsUri],
        })
        if (!txr) {
          throw new Error('Transaction refused')
        }
        await waitForTransactionReceipt(config, {
          hash: txr,
        })
        setLoading(false)
        addBotMessage(
          'Your profile has been created. Welcome to Conneqt!. \n Redirecting you to the dashboard...'
        )

        if (typeof onComplete === 'function') {
          setTimeout(() => onComplete(), 1000)
        }
      } catch (e) {
        setLoading(false)
        toast.error(
          e.details || e.message || 'Error creating profile. Please try again.'
        )
        addBotMessage(
          'There was an error creating your profile. Please try again.'
        )
      }
    }, 1500)
  }

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
          <div className='flex flex-col items-center gap-4'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
            />
            {userData.imageUrl ? (
              <div className='flex flex-col items-center'>
                <div className='relative w-32 h-32 rounded-full overflow-hidden border-2 border-purple-400 mb-4'>
                  <Image
                    src={userData.imageUrl}
                    alt='Profile preview'
                    fill
                    className='object-cover'
                  />
                </div>
                <p className='text-gray-400 text-sm mb-4'>
                  This is how your profile picture will look
                </p>
              </div>
            ) : (
              <div className='bg-gray-800/50 rounded-xl p-8 mb-4 text-center'>
                <Upload className='h-12 w-12 text-gray-500 mx-auto mb-3' />
                <p className='text-gray-400'>
                  Please upload a profile picture to continue
                </p>
              </div>
            )}

            <div className='flex items-center gap-4'>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant='outline'
                className='flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800'
                disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>{"Uploading..."}</span>
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4' />
                    <span>
                      {userData.imageUrl ? 'Change Image' : 'Select Image'}
                    </span>
                  </>
                )}
              </Button>

              {userData.imageUrl && (
                <Button
                  onClick={handleFinalImageSubmission}
                  className='bg-purple-600 hover:bg-purple-700'
                  disabled={loading}>
                  <Check className='h-4 w-4 mr-2' />
                  <span>Use This Photo</span>
                </Button>
              )}
            </div>
          </div>
        )

      case 'role':
        return (
          <div className='grid grid-cols-3 gap-4'>
            {['doctor', 'client', 'researcher'].map((role) => (
              <Button
                key={`role-${role}`}
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
              onClick={handleCompletionClick}
              className='px-8 bg-purple-600 hover:bg-purple-700'
              disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  <span>{"Creating Profile..."}</span>
                </>
              ) : (
                <span>Continue to Dashboard</span>
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Card className='flex flex-col mt-20 h-[700px] shadow-xl rounded-xl overflow-hidden border border-purple-400/30 bg-gray-900 w-[1200px]'>
        <div className='bg-gray-800 p-4 text-purple-400 flex items-center gap-2 border-b border-purple-400/20'>
          <MessageCircle className='h-5 w-5' />
          <h2 className='font-semibold'>Onboarding Assistant</h2>
        </div>

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
                  ) : message.imageUrl ? (
                    <div className='w-8 h-8 rounded-full overflow-hidden'>
                      <Image
                        src={message.imageUrl}
                        alt='Profile'
                        width={32}
                        height={32}
                        className='object-cover w-full h-full'
                      />
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
                    <div>{message.text}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className='p-6 border-t border-purple-400/20 bg-gray-800'>
          {renderInputSection()}
        </div>
      </Card>

      <Dialog
        open={showEditModal}
        onOpenChange={setShowEditModal}>
        <DialogContent className='bg-gray-900 border border-purple-500/30 text-white'>
          <DialogHeader>
            <DialogTitle className='text-xl text-purple-400'>
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <div className='py-4 space-y-4'>
            <div className='flex justify-center mb-4'>
              {userData.imageUrl && (
                <div className='relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-400'>
                  <Image
                    src={userData.imageUrl}
                    alt={userData.name}
                    fill
                    className='object-cover'
                  />
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <label className='text-sm text-gray-400'>Name</label>
              <Input
                value={userData.name}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
                className='bg-gray-800 border-gray-700 text-white'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm text-gray-400'>Role</label>
              <Select
                value={userData.role}
                onValueChange={(value) =>
                  setUserData((prev) => ({ ...prev, role: value }))
                }>
                <SelectTrigger className='bg-gray-800 border-gray-700 text-white'>
                  <SelectValue placeholder='Select your role' />
                </SelectTrigger>
                <SelectContent className='bg-gray-800 border-gray-700 text-white'>
                  <SelectItem value='doctor'>Doctor</SelectItem>
                  <SelectItem value='client'>Client</SelectItem>
                  <SelectItem value='researcher'>Researcher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowEditModal(false)}
              className='border-gray-700 text-gray-300 hover:bg-gray-800'>
              Cancel
            </Button>
            <Button
              onClick={handleEditProfile}
              className='bg-purple-600 hover:bg-purple-700'>
              <Check className='h-4 w-4 mr-2' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
