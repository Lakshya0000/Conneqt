'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Upload, Loader2, ImageIcon, FileText } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { uploadToIpfs, uploadToIpfsJson } from '@/contract'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { createCompanyConfig, getProfileConfig } from '@/contract/function'

const CreateChannel = () => {
  // State management
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [mounted,setMounted] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    intro: '',
    description: '',
    profileIcon: null,
    profileIconPreview: null,
    bannerImage: null,
    bannerImagePreview: null,
  })
  useEffect(()=>{
    setMounted(true)
  },[])
  // Refs for file inputs
  const profileIconRef = useRef(null)
  const bannerImageRef = useRef(null)
  const {writeContractAsync} = useWriteContract();
  const {address} = useAccount();
  const {data : profileData, isLoading: profileLoading} = useReadContract({...getProfileConfig,args:[address],enabled: !!address});
  useEffect(() => {
    if (profileData && !profileLoading) {
        console.log("Profile data:", profileData);
      setHasProfile(true)
    }
  }, [profileData, profileLoading])
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle file selection for profile icon
  const handleProfileIconChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        profileIcon: file,
        profileIconPreview: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  // Handle file selection for banner image
  const handleBannerImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        bannerImage: file,
        bannerImagePreview: reader.result,
      }))
    }
    reader.readAsDataURL(file)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)

      // Upload profile icon to IPFS if provided
      let profileIconUrl = null
      if (formData.profileIcon) {
        profileIconUrl = await uploadToIpfs(formData.profileIcon)
      }

      // Upload banner image to IPFS if provided
      let bannerImageUrl = null
      if (formData.bannerImage) {
        bannerImageUrl = await uploadToIpfs(formData.bannerImage)
      }

      // Prepare channel metadata
      const channelMetadata = {
        title: formData.title,
        intro: formData.intro,
        description: formData.description,
        profileIcon: profileIconUrl,
        bannerImage: bannerImageUrl,
        creator: address,
      }

      // Upload metadata to IPFS
      const metadataUrl = await uploadToIpfsJson(channelMetadata)
      console.log(metadataUrl)
      const hash = await writeContractAsync({...createCompanyConfig,args:[metadataUrl]})
      console.log(hash)
      toast.success('Channel created successfully!')

      // Reset form and close modal
      setFormData({
        title: '',
        intro: '',
        description: '',
        profileIcon: null,
        profileIconPreview: null,
        bannerImage: null,
        bannerImagePreview: null,
      })
      setShowModal(false)
    } catch (error) {
      console.error('Error creating channel:', error)
      toast.error('Failed to create channel. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  if(!mounted) return null;
  if(!hasProfile && !profileLoading) return null;

  if(profileLoading) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className='fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 z-50 border border-white'
        aria-label='Create new channel'>
        <Plus className='w-6 h-6' /> 
      </button>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <Card className='w-full max-w-2xl bg-gray-900 border border-purple-400/30 overflow-hidden shadow-xl animate-in fade-in duration-300'>
            {/* Header */}
            <div className='bg-gray-800 p-4 flex items-center justify-between border-b border-purple-400/20'>
              <h2 className='text-xl font-semibold text-purple-400 flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                Create New Channel
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-400 hover:text-white transition-colors'>
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className='p-6 space-y-6'>
              {/* Banner Image Preview */}
              <div
                className='w-full h-40 rounded-lg overflow-hidden bg-gray-800/50 border border-dashed border-purple-400/40 relative cursor-pointer group'
                onClick={() => bannerImageRef.current?.click()}>
                {formData.bannerImagePreview ? (
                  <Image
                    src={formData.bannerImagePreview}
                    fill
                    alt='Banner preview'
                    className='object-cover'
                  />
                ) : (
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors'>
                    <ImageIcon className='w-10 h-10 mb-2' />
                    <span>Click to upload banner image</span>
                  </div>
                )}
                <input
                  ref={bannerImageRef}
                  type='file'
                  accept='image/*'
                  onChange={handleBannerImageChange}
                  className='hidden'
                />
              </div>

              {/* Profile Icon + Details */}
              <div className='flex gap-6'>
                {/* Profile Icon */}
                <div
                  className='w-24 h-24 rounded-full overflow-hidden bg-gray-800/50 border border-dashed border-purple-400/40 flex-shrink-0 relative cursor-pointer group'
                  onClick={() => profileIconRef.current?.click()}>
                  {formData.profileIconPreview ? (
                    <Image
                      src={formData.profileIconPreview}
                      fill
                      alt='Profile icon preview'
                      className='object-cover'
                    />
                  ) : (
                    <div className='absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors'>
                      <Upload className='w-6 h-6 mb-1' />
                      <span className='text-xs'>Icon</span>
                    </div>
                  )}
                  <input
                    ref={profileIconRef}
                    type='file'
                    accept='image/*'
                    onChange={handleProfileIconChange}
                    className='hidden'
                  />
                </div>

                {/* Title + Intro */}
                <div className='flex-1 space-y-4'>
                  <div>
                    <label className='text-sm text-gray-400 mb-1 block'>
                      Channel Title*
                    </label>
                    <Input
                      name='title'
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder='Enter channel name'
                      maxLength={50}
                      className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                      required
                    />
                  </div>
                  <div>
                    <label className='text-sm text-gray-400 mb-1 block'>
                      Brief Introduction
                    </label>
                    <Input
                      name='intro'
                      value={formData.intro}
                      onChange={handleInputChange}
                      placeholder='Short tagline for your channel'
                      maxLength={100}
                      className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='text-sm text-gray-400 mb-1 block'>
                  Description*
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Detailed description of your channel'
                  rows={5}
                  className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none'
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-700'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowModal(false)}
                  className='border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
                  disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6'
                  disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Channel</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}

export default CreateChannel
