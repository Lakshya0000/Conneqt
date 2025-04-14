'use client'

import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { MessageCircle, User, Upload, UserRound } from 'lucide-react'
import Image from 'next/image'
import { createProfile, uploadToIpfs } from '../../contract/index'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { companyABI } from '@/contract/contract'
import { companyAddress } from '@/contract/contract'
export function OnBoarding() {
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
  const [imghsh, setImghsh] = useState('')
  const [imgLoader, setImgLoader] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const { writeContract,isPending,data } = useWriteContract()
  const {isLoading,isSuccess} = useWaitForTransactionReceipt({data});
  const uploadImageIPFS=async (event)=>{
    event.preventDefault();
    console.log("File input changed", event);
    const file =event.target.files[0];
    if(!file){
      console.log("Enter file");return;
    }

    const formData=new FormData()
    formData.append('file', file);
    const metaData=JSON.stringify({
      name:file.name
    })
    formData.append("pinataMetadata",metaData);
    try{
      setImgLoader(true);
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: `35cb1bf7be19d2a8fa0d`,
          pinata_secret_api_key: `2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50`,
          "Content-Type": "multipart/form-data",
        },
      });

      const resData=res.data;
      setUserData((prev) => ({
        ...prev,
        imageUrl: `https://ipfs.io/ipfs/${resData.IpfsHash}`,
      }));
      setImgLoader(false);
    }catch(error){
      setImgLoader(false);
      window.alert("ipfs image upload error : ", error);
    }
  }

  const mintProfile = async () => {
    if (!userData) return

    try {
      setLoading(true)
      const data = JSON.stringify({
        name: userData.name,
        imageUrl: userData.imageUrl,
        role: userData.role,
      })

      console.log('Uploading to IPFS:', data)

      const res = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data: data,
        headers: {
          pinata_api_key: `35cb1bf7be19d2a8fa0d`,
          pinata_secret_api_key: `2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50`,
          'Content-Type': 'application/json',
        },
      })

      const resData = res.data
      console.log('IPFS Response:', resData)
      // const profileURI = `https://ipfs.io/ipfs/${resData.IpfsHash}`
      const profileURI = `https://ipfs.io/ipfs/QmTr1rG9LdDmShZjarD9wFh15JoJkmiWSP6jSH2m3QgunR`
      writeContract({
        address: companyAddress,
        abi: companyABI,
        functionName: 'createProfile',
        args: [profileURI],
      })
    } catch (error) {
      setLoading(false)
      console.error('Minting error:', error)
      window.alert(
        'Minting error: ' + (error.response?.data?.error || error.message)
      )
    }
  }
  useEffect(()=>{
    console.log("hash",data);
  },[data])
  useEffect(() => {
    if(isSuccess){
      console.log("Profile minted successfully");
    }
  },[isSuccess])
  
  useEffect(() => {
    if(messages?.length === 0){setTimeout(() => {
      addMessage(
        "Hi there! I'm your onboarding assistant. What's your name?",
        'ai'
      )
    }, 500)}
  }, [])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (text, sender, delay = 0) => {
    if (sender === 'ai' && delay > 0) {
      setIsTyping(true)
      const typingMessage = {
        id: Date.now(),
        text: '',
        sender: 'ai',
        isTyping: true,
      }
      setMessages((prev) => [...prev, typingMessage])

      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) =>
          prev
            .filter((msg) => !msg.isTyping)
            .concat({
              id: Date.now(),
              text,
              sender,
            })
        )
      }, delay)
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text,
          sender,
        },
      ])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // if (!input.trim() ) return

    if (currentStep === 'name') {
      // Save the input value to use later
      const nameValue = input
      addMessage(nameValue, 'user')
      setUserData({ ...userData, name: nameValue })
      setInput('')

      setTimeout(() => {
        addMessage(
          'Nice to meet you, ' +
            nameValue +
            '! Could you please upload a profile picture?',
          'ai',
          1000
        )
        setCurrentStep('image')
      }, 500)
    }
  }

  const handleFileSubmit = () => {
    if (!userData.imageUrl) return
    setImgLoader(true)
    setTimeout(() => {
      addMessage('Image uploaded successfully!', 'user')
      addMessage('What role do you identify with?', 'ai', 1000)
      setImgLoader(false)
      setCurrentStep('role')
    }, 500)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Create a temporary URL for the selected image
    setImgLoader(true)
    const imageUrl = await uploadToIpfs(file)
    if (!imageUrl) {
      setImgLoader(false)
      window.alert('Image upload error')
      return
    }
    console.log('Image URL:', imageUrl)
    setImgLoader(false)
    setUserData({ ...userData, imageUrl })
  }

  const handleRoleSelect = (role) => {
    setUserData({ ...userData, role })

    const roleText = role.charAt(0).toUpperCase() + role.slice(1)
    addMessage(`I'm a ${roleText}`, 'user')

    setTimeout(() => {
      addMessage(
        `Thank you! You've been registered as a ${role}. Welcome aboard!`,
        'ai',
        1000
      )
      setCurrentStep('complete')
    }, 500)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className='flex flex-col h-[800px] shadow-xl rounded-xl overflow-hidden border border-purple-400/30 bg-gray-900 w-[1200px]'>
      <div className='bg-gray-800 p-4 text-purple-400 flex items-center gap-2 border-b border-purple-400/20'>
        <MessageCircle className='h-5 w-5' />
        <h2 className='font-semibold'>Onboarding Assistant</h2>
      </div>

      <div className='flex-1 overflow-y-auto p-4 bg-gray-900'>
        <div className='space-y-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'ai' ? 'justify-start' : 'justify-end'
              }`}>
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
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
                  className={`rounded-lg p-3 ${
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
      </div>

      <div className='p-4 border-t border-purple-400/20 bg-gray-800'>
        {currentStep === 'name' && (
          <form
            onSubmit={handleSubmit}
            className='flex gap-2'>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Enter your name...'
              className='flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
              autoFocus
            />
            <Button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700'>
              Send
            </Button>
          </form>
        )}

        {currentStep === 'image' && (
          <div className='flex flex-col gap-3'>
            {/* Hidden input */}
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
            />

            {/* Simple direct upload button */}
            <div className='flex items-center justify-center gap-4'>
              {userData.imageUrl && (
                <div className='relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400'>
                  <Image
                    src={userData.imageUrl}
                    alt='Profile preview'
                    fill
                    className='object-cover'
                  />
                </div>
              )}

              <Button
                onClick={triggerFileInput}
                className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700'>
                <Upload className='h-4 w-4' />
                {userData.imageUrl ? 'Change Image' : 'Upload Profile Picture'}
              </Button>

              {userData.imageUrl && (
                <Button
                  className='bg-purple-600 hover:bg-purple-700'
                  onClick={handleFileSubmit}>
                  Next
                </Button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'role' && (
          <div className='grid grid-cols-3 gap-3'>
            <Button
              onClick={() => handleRoleSelect('doctor')}
              variant='outline'
              className='flex flex-col items-center gap-2 p-4 h-auto border-purple-400/50 text-purple-400 hover:bg-purple-400/10'>
              <UserRound className='h-8 w-8 text-purple-400' />
              <span>Doctor</span>
            </Button>

            <Button
              onClick={() => handleRoleSelect('client')}
              variant='outline'
              className='flex flex-col items-center gap-2 p-4 h-auto border-purple-400/50 text-purple-400 hover:bg-purple-400/10'>
              <UserRound className='h-8 w-8 text-purple-400' />
              <span>Client</span>
            </Button>

            <Button
              onClick={() => handleRoleSelect('researcher')}
              variant='outline'
              className='flex flex-col items-center gap-2 p-4 h-auto border-purple-400/50 text-purple-400 hover:bg-purple-400/10'>
              <UserRound className='h-8 w-8 text-purple-400' />
              <span>Researcher</span>
            </Button>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className='flex justify-center'>
            <Button
              onClick={mintProfile}
              className='px-8 bg-purple-600 hover:bg-purple-700'>
              Continue to Dashboard
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
