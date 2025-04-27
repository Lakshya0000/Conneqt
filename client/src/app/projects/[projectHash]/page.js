'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  ArrowLeft,
  Edit2,
  History,
  X,
  Split,
  Eye,
  GitCompare,
  Users,
  Loader2,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import * as Diff from 'diff'
import { toast } from 'sonner'
import {
  readContract,
  readContracts,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'
import { useAccount, useConfig } from 'wagmi'
import {
    assignCollaboratorConfig,
  checkOwnerConfig,
  getLatestResearchConfig,
  getResearchVersionConfig,
  isOwnerOrCollaboratorConfig,
  updateResearchConfig,
} from '@/contract/function'
import { getJsonFromIpfs, uploadToIpfsJson } from '@/contract'
import { useWalletContext } from '@/context/WalletContext'

const getDiff = (oldText, newText) => {
  return Diff.diffWords(oldText, newText)
}

// Add this function to your component
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown time'

  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now - date) / 1000)

  // Handle invalid date
  if (isNaN(seconds)) return 'Invalid date'

  let interval = Math.floor(seconds / 31536000) // years
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`
  }

  interval = Math.floor(seconds / 2592000) // months
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`
  }

  interval = Math.floor(seconds / 86400) // days
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`
  }

  interval = Math.floor(seconds / 3600) // hours
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`
  }

  interval = Math.floor(seconds / 60) // minutes
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`
  }

  return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`
}

const Page = () => {
  const router = useRouter()
  const config = useConfig()
  const [title, setTitle] = useState('')
  const { isConnected, address } = useAccount()
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [versions, setVersions] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const { projectHash } = useParams()
  const [compareMode, setCompareMode] = useState('view')
  const [versionLoading, setVersionLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isCollaborator, setIsCollaborator] = useState(false)
  const [collabAddress, setCollabAddress] = useState('')
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false)
  const {profileData, loading : profileLoading} = useWalletContext()
  const fetchVersions = async (totalVersions, id) => {
    try {
      setVersionLoading(true)
      let versionConfig = []
      for (let i = 1; i <= totalVersions; i++) {
        versionConfig.push({
          ...getResearchVersionConfig,
          args: [id, i],
        })
      }
      const versionsDetails = await readContracts(config, {
        contracts: versionConfig,
      })
      const versionsData = await Promise.all(
        versionsDetails.map(async (data, index) => {
          const version = await getJsonFromIpfs(data.result)
          console.log('Version data:', version)
          return {
            id: index + 1,
            content: version.content,
            version: 'v' + id + '.' + (index + 1),
            timestamp: version.timestamp,
          }
        })
      )
      versionsData.reverse()
      setContent(versionsData[0].content)
      setOriginalContent(versionsData[0].content)
      setVersionLoading(false)
      return versionsData
    } catch (e) {
      console.error('Error fetching versions:', e)
      toast.error('Failed to fetch project versions')
      setVersionLoading(false)
      return [
        {
          id: 0,
          content: 'Error fetching versions',
          version: 'Error',
          timestamp: new Date().toISOString(),
        },
      ]
    }
  }
  const fetchProject = async (id) => {
    try {
      const project = await readContract(config, {
        ...getLatestResearchConfig,
        args: [id],
      })
      const versionsData = await fetchVersions(project[2], id)
      const owner = await readContract(config, {
        ...checkOwnerConfig,
        args: [id],
      })
      const isCollaborator = await readContract(config, {
        ...isOwnerOrCollaboratorConfig,
        args: [id, address],
      })
      setIsOwner(owner === address)
      setIsCollaborator(isCollaborator)
      setTitle(project[0])
      setVersions(versionsData)
    } catch (e) {
      console.error('Error fetching project:', e)
      toast.error('Failed to fetch project data')
      router.push('/projects')
      return
    }
  }
  useEffect(() => {
      if (!isConnected) {
        toast.warning('Please connect your wallet.')
        return
      }
      if (profileLoading) return
      if (isConnected && address) {
        if (!profileData || profileData.length === 0) {
          toast.info("You don't have a profile yet.")
          router.push('/')
          return
        }
      }
    }, [isConnected, address, profileData, router])
  useEffect(() => {
    // Mock data fetch
    if (projectHash === '') {
      router.push('/projects')
      return
    }
    const id = Number(projectHash)
    if (isNaN(id)) {
      toast.error('Invalid project ID')
      router.push('/projects')
      return
    }
    fetchProject(id)
  }, [projectHash, address, isConnected])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (content.trim() === originalContent.trim()) {
      toast.error('No changes made to save.')
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    let transact = null
    try {
      const id = Number(projectHash)
      transact = toast.loading('Saving changes...')
      const projectContent = {
        content,
        timestamp: new Date().toISOString(),
      }
      const projectContentUri = await uploadToIpfsJson(projectContent)
      const txr = await writeContract(config, {
        ...updateResearchConfig,
        args: [id, projectContentUri],
      })
      await waitForTransactionReceipt(config, {
        hash: txr,
      })
      await fetchProject(id)
      toast.dismiss(transact)
      toast.success('Changes saved successfully!')
    } catch (e) {
      console.error('Error saving project:', e)
      toast.dismiss(transact)
      setContent(originalContent)
      toast.error('Failed to save changes.')
    } finally {
      setIsEditing(false)
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setContent(originalContent)
    setIsEditing(false)
  }

  const handleCompare = () => {
    setSelectedVersion(null)
    setShowComparison(true)
  }

  const handleAssign = async() => {
    setIsSubmittingCollab(true)
    let transact = null
    try{
        const expiresAt = Date.now() + 24*60*60*1000
        const id = Number(projectHash)
        transact = toast.loading('Assigning collaborator...')
        const txr = await writeContract(config, {
            ...assignCollaboratorConfig, args: [id, collabAddress, expiresAt]
        })
        await waitForTransactionReceipt(config, {
            hash: txr,
        })
        toast.dismiss(transact)
        toast.success('Collaborator assigned successfully!')
        setCollabAddress('')
        setShowCollabModal(false)
    }
    catch(e){
        toast.dismiss(transact)
        toast.error('Failed to assign collaborator. Please check the address and try again.')
        console.error('Error assigning collaborator:', e)
    }
    finally{
        setIsSubmittingCollab(false)
    }
  }

  return (
    <div className='mt-20 min-h-screen bg-gradient-to-b from-gray-950 to-black text-white'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]' />
      <div className='fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]' />

      <div className='relative z-10 p-6 max-w-7xl mx-auto pt-20'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 text-gray-400 hover:text-white transition-colors'>
            <ArrowLeft className='w-5 h-5' />
            Back to Projects
          </button>

          {/* Title display in the middle */}
          <h1 className='text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
            {title}
          </h1>

          <div className='flex gap-3'>
            {/* Assign Collaborator Button - Only visible to the owner */}
            {isOwner && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCollabModal(true)}
                className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl
                         flex items-center gap-2'>
                <Users className='w-5 h-5' />
                Assign
              </motion.button>
            )}

            {versions.length > 0 && !isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCompare}
                className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl
                         flex items-center gap-2'>
                <Split className='w-5 h-5' />
                Compare Versions
              </motion.button>
            )}

            {/* Edit button - Only visible to collaborators or owners */}
            {!showComparison &&
              (isOwner || isCollaborator) &&
              (!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl
                           flex items-center gap-2'>
                  <Edit2 className='w-5 h-5' />
                  Edit
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl'>
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                             hover:from-purple-700 hover:to-pink-700 flex items-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed'>
                    <Save className='w-5 h-5' />
                    Save Changes
                  </motion.button>
                </>
              ))}
          </div>
        </div>

        {/* Comparison Mode Controls */}
        {showComparison && (
          <div className='mb-6 bg-gray-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-500/10'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
              <div className='flex gap-4'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCompareMode('view')
                    setShowComparison(false)
                  }}
                  className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                                            ${
                                              compareMode === 'view'
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}>
                  <Eye className='w-4 h-4' />
                  View Latest
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCompareMode('diff')}
                  className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                                            ${
                                              compareMode === 'diff'
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}>
                  <GitCompare className='w-4 h-4' />
                  Compare
                </motion.button>
              </div>
              {compareMode === 'diff' && (
                <select
                  value={selectedVersion?.id || ''}
                  onChange={(e) => {
                    const version = versions.find(
                      (v) => v.id === Number(e.target.value)
                    )
                    setSelectedVersion(version)
                  }}
                  className='w-full sm:w-auto px-6 py-3 bg-gray-800 text-white rounded-xl
                                            border border-purple-500/20 focus:border-purple-500/50 transition-all
                                            outline-none cursor-pointer'>
                  <option value=''>Select version to compare</option>
                  {versions.map((v) => {
                    // Format timestamp as "time ago"
                    const timeAgo = formatTimeAgo(v.timestamp)

                    return (
                      <option
                        key={v.id}
                        value={v.id}>
                        {v.version} - {timeAgo}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Editor Section */}
        <div
          className={`grid ${
            compareMode === 'diff' && showComparison
              ? 'grid-cols-2 gap-6'
              : 'grid-cols-1'
          }`}>
          {/* Current Version */}
          <motion.div
            layout
            className='bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/10 p-6
                                 shadow-lg shadow-purple-500/5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='text-sm text-gray-400'>Current Version</div>
              {!showComparison && (
                <span className='px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs'>
                  Latest
                </span>
              )}
            </div>

            {versionLoading ? (
              <div className='w-full h-[70vh] flex flex-col items-center justify-center'>
                <div className='relative'>
                  <div className='h-16 w-16 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin' />
                  <div
                    className='absolute top-0 left-0 h-16 w-16 rounded-full border-r-4 border-pink-500 animate-spin'
                    style={{ animationDuration: '1.5s' }}
                  />
                </div>
                <p className='mt-4 text-sm text-purple-300'>
                  Loading content...
                </p>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => isEditing && setContent(e.target.value)}
                readOnly={!isEditing || showComparison}
                className={`w-full h-[70vh] bg-transparent text-white resize-none focus:outline-none
                             text-lg leading-relaxed ${
                               (!isEditing || showComparison) &&
                               'cursor-default'
                             }
                             scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent
                             hover:scrollbar-thumb-purple-500/30`}
                placeholder='Start writing your research paper...'
              />
            )}
          </motion.div>

          {/* Comparison Version */}
          {compareMode === 'diff' && showComparison && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/10 p-6
                                     shadow-lg shadow-purple-500/5'>
              <div className='text-sm text-gray-400 mb-4'>
                {selectedVersion ? (
                  <div className='flex items-center justify-between'>
                    <span>{selectedVersion.version}</span>
                    <span className='text-xs text-gray-500'>
                      {new Date(selectedVersion.timestamp).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  'Select a version to compare'
                )}
              </div>
              {selectedVersion ? (
                compareMode === 'diff' ? (
                  <div className='h-[70vh] overflow-auto p-4 text-lg leading-relaxed font-sans'>
                    {getDiff(selectedVersion.content, content).map(
                      (part, i) => (
                        <span
                          key={i}
                          className={`${
                            part.added
                              ? 'bg-green-500/10 text-green-400 border-b border-green-500/30'
                              : part.removed
                              ? 'bg-red-500/10 text-red-400 border-b border-red-500/30'
                              : 'text-white'
                          }`}>
                          {part.value.trim() + ' '}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <textarea
                    value={selectedVersion.content}
                    readOnly
                    className='w-full h-[70vh] bg-transparent text-white resize-none focus:outline-none
                                                 text-lg leading-relaxed cursor-default scrollbar-thin 
                                                 scrollbar-thumb-purple-500/20 scrollbar-track-transparent
                                                 hover:scrollbar-thumb-purple-500/30'
                  />
                )
              ) : (
                <div className='h-[70vh] flex items-center justify-center text-gray-500'>
                  Select a version from the dropdown above to compare
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      {/* Collaborator Assignment Modal */}
      <AnimatePresence>
        {showCollabModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'
            onClick={(e) => {
              // Close modal when clicking outside
              if (e.target === e.currentTarget) {
                setShowCollabModal(false)
              }
            }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-gray-900 rounded-xl w-full max-w-md overflow-hidden'
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className='flex justify-between items-center p-6 border-b border-gray-800'>
                <h3 className='text-xl font-semibold'>Assign Collaborator</h3>
                <button
                  onClick={() => setShowCollabModal(false)}
                  className='text-gray-400 hover:text-white transition-colors'>
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Modal Body */}
              <div className='p-6'>
                <div className='mb-6'>
                  <label className='block text-sm text-gray-400 mb-2'>
                    Collaborator Address
                  </label>
                  <input
                    type='text'
                    value={collabAddress}
                    onChange={(e) => setCollabAddress(e.target.value)}
                    placeholder='0x...'
                    className='w-full p-3 bg-gray-800 rounded-lg border border-gray-700 
                              text-white focus:border-purple-500 focus:outline-none transition-colors'
                    disabled={isSubmittingCollab}
                  />
                  <p className='mt-2 text-xs text-gray-500'>
                    Enter the wallet address of the person you want to grant
                    edit access to this research paper.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className='p-6 border-t border-gray-800 flex justify-end gap-3'>
                <button
                  onClick={() => setShowCollabModal(false)}
                  className='px-6 py-3 text-gray-400 hover:text-white transition-colors'
                  disabled={isSubmittingCollab}>
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={
                    isSubmittingCollab || !collabAddress.trim().startsWith('0x')
                  }
                  className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                            hover:from-purple-500 hover:to-pink-500 flex items-center gap-2
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all'>
                  {isSubmittingCollab ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Users className='w-5 h-5' />
                      Assign Collaborator
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Page
