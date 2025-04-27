'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Book, FileText, X, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAccount, useConfig } from 'wagmi'
import { useWalletContext } from '@/context/WalletContext'
import { toast } from 'sonner'
import {
  readContract,
  readContracts,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'
import {
  createResearchConfig,
  getLatestResearchConfig,
  totalResearchesConfig,
} from '@/contract/function'
import { getJsonFromIpfs, uploadToIpfsJson } from '@/contract'
import Loader from '@/components/loader'

// Animated loader component - Similar to landing page
const ResearchLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-gradient-to-b from-gray-950/95 to-black/95 backdrop-blur-sm flex flex-col items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='relative group z-10'>
        {/* Glow effect */}
        <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity' />

        {/* Spinning rings */}
        <div className='h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin' />
        <div
          className='absolute top-0 left-0 h-24 w-24 rounded-full border-r-4 border-pink-500 animate-spin'
          style={{ animationDuration: '1.5s' }}
        />

        {/* Center icon */}
        <motion.div
          className='absolute inset-0 flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          <Loader2 className='h-8 w-8 text-purple-400 animate-spin' />
        </motion.div>
      </motion.div>

      <motion.p
        className='mt-8 text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium relative z-10'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>
        Loading research papers...
      </motion.p>
    </motion.div>
  )
}

const Page = () => {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const { loading: profileLoading, profileData } = useWalletContext()
  const [loading, setLoading] = useState(true)
  const config = useConfig()
  const [projects, setProjects] = useState([])

  // New state for the modal
  const [showNewPaperModal, setShowNewPaperModal] = useState(false)
  const [newPaperTitle, setNewPaperTitle] = useState('')
  const [newPaperContent, setNewPaperContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const totalProjects = await readContract(config, {
        ...totalResearchesConfig,
      })
      let projectConfig = []
      if (totalProjects && totalProjects > 0) {
        for (let i = 0; i < totalProjects; i++) {
          projectConfig.push({
            ...getLatestResearchConfig,
            args: [i],
          })
        }
        const projects = await readContracts(config, {
          contracts: projectConfig,
        })
        console.log('Projects:', projects)
        let ids = 0
        const projectDetails = await Promise.all(
          projects.map(async (data) => {
            const project = data.result
            const obj = await getJsonFromIpfs(project[1])
            console.log('Project:', obj)
            return {
              id: ids++,
              title: project[0],
              preview:
                obj.content.slice(0, 100) +
                (obj.content.length > 100 ? '...' : ''),
              timestamp: obj.timestamp,
              edits: Number(project[2]),
            }
          })
        )
        setProjects(projectDetails)
      }
      console.log('Total Projects:', totalProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load research papers')
    } finally {
      // Set loading to false when done fetching
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address && profileData) {
      fetchProjects()
    }
  }, [profileData, address, config])

  // Handle new paper submission
  const handleNewPaperSubmit = async () => {
    if (!newPaperTitle.trim()) {
      toast.error('Please enter a title for your paper')
      return
    }

    if (!newPaperContent.trim()) {
      toast.error('Please enter some content for your paper')
      return
    }

    setIsSubmitting(true)
    let transact = null
    try {
      // Create a new paper object with submission timestamp
      const newPaper = {
        title: newPaperTitle,
        content: newPaperContent,
        timestamp: new Date().toISOString(), // Record current time
        preview: newPaperContent.slice(0, 100) + '...',
      }

      const projectContent = {
        content: newPaperContent.trim(),
        timestamp: new Date().toISOString(),
      }
      const projectContentUri = await uploadToIpfsJson(projectContent)
      console.log('Project content uploaded to IPFS:', projectContentUri)
      transact = toast.loading('Waiting For Conformation...')
      const tx = await writeContract(config, {
        ...createResearchConfig,
        args: [newPaperTitle.trim(), projectContentUri],
      })
      toast.dismiss(transact)
      if (!tx) {
        toast.error('Transaction failed')
        return
      }
      transact = toast.loading('Creating Research Paper...')
      await waitForTransactionReceipt(config, {
        hash: tx,
      })
      toast.dismiss(transact)
      setProjects([...projects, { ...newPaper, id: projects.length + 1 }])
      toast.success('Research paper created successfully!')
      setShowNewPaperModal(false)
      setNewPaperTitle('')
      setNewPaperContent('')

      // Refresh projects after creating a new one
      fetchProjects()
    } catch (error) {
      toast.dismiss(transact)
      console.error('Error creating paper:', error)
      toast.error('Failed to create research paper')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const ProjectCard = ({ project }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/projects/${project.id}`)}
      className='bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 rounded-xl 
                 border border-purple-500/10 hover:border-purple-500/30 cursor-pointer
                 backdrop-blur-sm transition-all duration-300 flex flex-col h-full'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <Book className='w-6 h-6 text-purple-400' />
          <h3 className='text-xl font-semibold text-white'>{project.title}</h3>
        </div>
        <button className='text-purple-400 hover:text-purple-300'>
          <FileText className='w-5 h-5' />
        </button>
      </div>

      {/* Preview section with flex-grow to push footer to bottom */}
      <p className='text-gray-400 text-sm line-clamp-3 mb-4 flex-grow'>
        {project.preview}
      </p>

      {/* Footer section */}
      <div className='flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-800/50'>
        <span>Last edited: {formatTimeAgo(project.timestamp)}</span>
        <div className='flex items-center gap-1.5 bg-purple-500/10 px-2 py-0.5 rounded-full'>
          <span className='text-purple-300'>{project.edits || 0}</span>
          <span className='text-gray-400'>
            {project.edits === 1 ? 'edit' : 'edits'}
          </span>
        </div>
      </div>
    </motion.div>
  )

  if(profileLoading || !profileData || profileData.length === 0) {
    return <Loader />
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-950 to-black text-white mt-20'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]' />
      <div className='fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]' />

      {/* Loading state using AnimatePresence for smooth transitions */}
      <AnimatePresence>{loading && <ResearchLoader />}</AnimatePresence>

      <div className='relative z-10 p-6 max-w-7xl mx-auto pt-20'>
        {/* Header */}
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
              Research Papers
            </h1>
            <p className='text-gray-400 mt-2'>
              Your research documents and drafts
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewPaperModal(true)}
            className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                       hover:from-purple-700 hover:to-pink-700 flex items-center gap-2'>
            <Plus className='w-5 h-5' />
            New Paper
          </motion.button>
        </div>

        {/* Project Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))
          ) : !loading ? (
            <div className='col-span-full text-center py-16'>
              <Book className='w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50' />
              <h3 className='text-xl text-gray-400 mb-2'>
                No research papers yet
              </h3>
              <p className='text-gray-500 max-w-md mx-auto'>
                Create your first research paper by clicking the "New Paper"
                button above.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* New Paper Modal */}
      <AnimatePresence>
        {showNewPaperModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'
            onClick={(e) => {
              // Close modal when clicking outside
              if (e.target === e.currentTarget) {
                setShowNewPaperModal(false)
              }
            }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-gray-900 rounded-xl w-full max-w-4xl overflow-hidden'
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className='flex justify-between items-center p-6 border-b border-gray-800'>
                <h3 className='text-xl font-semibold'>
                  Create New Research Paper
                </h3>
                <button
                  onClick={() => setShowNewPaperModal(false)}
                  className='text-gray-400 hover:text-white transition-colors'>
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Modal Body */}
              <div className='p-6'>
                <div className='mb-6'>
                  <label className='block text-sm text-gray-400 mb-2'>
                    Paper Title
                  </label>
                  <input
                    type='text'
                    value={newPaperTitle}
                    onChange={(e) => setNewPaperTitle(e.target.value)}
                    placeholder='Enter title for your research paper'
                    className='w-full p-3 bg-gray-800 rounded-lg border border-gray-700 
                              text-white focus:border-purple-500 focus:outline-none transition-colors'
                    disabled={isSubmitting}
                  />
                </div>

                <div className='mb-6'>
                  <label className='block text-sm text-gray-400 mb-2'>
                    Paper Content
                  </label>
                  <textarea
                    value={newPaperContent}
                    onChange={(e) => setNewPaperContent(e.target.value)}
                    placeholder='Start writing your research paper...'
                    className='w-full h-[40vh] p-3 bg-gray-800 rounded-lg border border-gray-700 
                              text-white resize-none focus:border-purple-500 focus:outline-none 
                              transition-colors scrollbar-thin scrollbar-thumb-purple-500/20 
                              scrollbar-track-transparent hover:scrollbar-thumb-purple-500/30'
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className='p-6 border-t border-gray-800 flex justify-end gap-3'>
                <button
                  onClick={() => setShowNewPaperModal(false)}
                  className='px-6 py-3 text-gray-400 hover:text-white transition-colors'
                  disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  onClick={handleNewPaperSubmit}
                  disabled={isSubmitting}
                  className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                            hover:from-purple-500 hover:to-pink-500 flex items-center gap-2
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className='w-5 h-5' />
                      Create Paper
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
