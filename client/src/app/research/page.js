'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Coins,
  FileText,
  Loader2,
  Plus,
  Sparkles,
} from 'lucide-react'
import {
  useConfig,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from 'wagmi'
import {
  startResearchCrowdfundingConfig,
  contributeToResearchConfig,
  getTotalFundingConfig,
  getResearchProjectConfig,
} from '@/contract/function'
import { formatEther, parseEther } from 'viem'
import { toast } from 'sonner'
import { escrowABI, escrowAddress } from '@/contract/contract'
import ResearchCard from '../components/ResearchCard'
import {
  readContract,
  readContracts,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'
import { useWalletContext } from '@/context/WalletContext'
import Loader from '@/components/loader'

// Project fetching loader component
const ProjectFetchingLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='flex flex-col items-center justify-center py-20'>
      <div className='relative'>
        <div className='h-16 w-16 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin' />
        <div
          className='absolute top-0 left-0 h-16 w-16 rounded-full border-r-4 border-pink-500 animate-spin'
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      <p className='mt-4 text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium'>
        Loading research projects...
      </p>
    </motion.div>
  )
}

const Page = () => {
  const [showModal, setShowModal] = useState(false)
  const { writeContractAsync } = useWriteContract()
  const { writeContractAsync: contributeAsync } = useWriteContract(
    contributeToResearchConfig
  )
  const [researchData, setResearchData] = useState([])
  const [contributionAmounts, setContributionAmounts] = useState({})
  const [activeTab, setActiveTab] = useState('ongoing')
  const [isProjectLoading, setIsProjectLoading] = useState(false)
  const [isTabChanging, setIsTabChanging] = useState(false)
  const [isContributing, setIsContributing] = useState(false)
  const [contributingProjectId, setContributingProjectId] = useState(null)
  const { loading: profileLoading, profileData } = useWalletContext()
  const config = useConfig()

  const [newResearch, setNewResearch] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewResearch({ ...newResearch, [name]: value })
  }

  const getContractConfigs = (totalProjects) => {
    if (!totalProjects) return []

    const configs = []
    for (let i = 1; i <= Number(totalProjects); i++) {
      configs.push({
        abi: escrowABI,
        address: escrowAddress,
        functionName: 'getResearchProject',
        args: [i],
      })
    }
    return configs
  }

  const fetchResearchProjects = async () => {
    setIsProjectLoading(true)
    try {
      const totalProjects = await readContract(config, {
        ...getTotalFundingConfig,
      })
      const contractConfigs = getContractConfigs(totalProjects)
      const projectsData = await readContracts(config, {
        contracts: contractConfigs,
      })
      console.log('Projects Data: ', projectsData)
      const processessedProjects = projectsData.map((project, index) => {
        if (!project?.result) return null

        const title = project.result[0]
        const description = 'This is Description'
        const amount = formatEther(project.result[2])
        const currentFunding = formatEther(project.result[3])
        const deadlineInSeconds = Number(project.result[4])

        return {
          id: index + 1,
          title,
          amount,
          currentFunding,
          deadlineInSeconds,
          description,
        }
      })
      setResearchData(
        processessedProjects.filter((project) => project !== null)
      )
    } catch (e) {
      console.error('Error fetching research projects:', e)
      toast.error('Error fetching research projects data')
      setResearchData([])
    } finally {
      setIsProjectLoading(false)
      setIsTabChanging(false)
    }
  }

  useEffect(() => {
    if (profileData && profileData.length > 0) {
      fetchResearchProjects()
    }
  }, [profileData])

  const handleCreateResearch = async () => {
    try {
      const amountInWei = parseEther(newResearch.amount.replace(' ETH', ''))
      const deadlineDate = new Date(newResearch.deadline)
      const currentDate = new Date()
      const durationInSeconds = Math.floor((deadlineDate - currentDate) / 1000)

      if (durationInSeconds <= 0) {
        alert('Deadline must be in the future')
        return
      }

      await writeContractAsync({
        ...startResearchCrowdfundingConfig,
        args: [newResearch.title, amountInWei, durationInSeconds],
      })

      toast.success('Research created successfully!')
      setNewResearch({
        title: '',
        description: '',
        amount: '',
        deadline: '',
      })
      setShowModal(false)
      // Refetch projects after creating a new one
      fetchResearchProjects()
    } catch (error) {
      console.error('Error creating research:', error)
      alert('Error creating research. Please try again.')
    }
  }

  const handleContribute = async (projectId) => {
    let transactToast = null
    setIsContributing(true)
    setContributingProjectId(projectId)

    try {
      const amount = contributionAmounts[projectId]
      if (!amount) {
        toast.info('Please enter a contribution amount')
        setIsContributing(false)
        setContributingProjectId(null)
        return
      }

      const amountInWei = parseEther(amount)
      transactToast = toast.loading('Contributing...')
      const txr = await writeContract(config, {
        ...contributeToResearchConfig,
        args: [projectId],
        value: amountInWei,
      })

      await waitForTransactionReceipt(config, {
        hash: txr,
      })

      // Clear the specific input field
      setContributionAmounts((prev) => ({
        ...prev,
        [projectId]: '',
      }))

      const updProject = await readContract(config, {
        ...getResearchProjectConfig,
        args: [projectId],
      })

      setResearchData((prev) => {
        const updatedProjects = [...prev]
        const projectIndex = updatedProjects.findIndex(
          (project) => project.id === projectId
        )
        if (projectIndex !== -1) {
          updatedProjects[projectIndex].currentFunding = formatEther(
            updProject[3]
          )
        }
        return updatedProjects
      })

      if (transactToast) toast.dismiss(transactToast)
      toast.success('Contribution successful!')
    } catch (error) {
      if (transactToast) toast.dismiss(transactToast)
      console.error('Error contributing:', error)
      toast.error('Failed to contribute. Please try again.')
    } finally {
      setIsContributing(false)
      setContributingProjectId(null)
    }
  }

  const handleTabChange = (tab) => {
    setIsTabChanging(true)
    setActiveTab(tab)
    // Add a small delay to show the loading animation
    setTimeout(() => {
      setIsTabChanging(false)
    }, 500)
  }

  if (profileLoading || !profileData || profileData.length === 0) {
    return <Loader />
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-950 to-black text-white overflow-hidden'>
      {/* Background Effects */}
      <div className='fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]' />
      <div className='fixed inset-0 bg-[radial-gradient(circle_600px_at_80%_40%,#4C0B7A,transparent)]' />
      <div className='fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]' />

      <div className='relative z-10 p-6 mt-20 max-w-7xl mx-auto'>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex justify-between items-center mb-12'>
          <h1 className='text-4xl font-bold'>
            <span className='bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent'>
              Research Projects
            </span>
            <span className='block mt-2 text-base font-normal text-gray-400'>
              Support groundbreaking research initiatives
            </span>
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            disabled={isProjectLoading || isContributing}
            className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                                 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20 
                                 transition-all duration-300 flex items-center gap-2 
                                 ${
                                   isProjectLoading || isContributing
                                     ? 'opacity-50 cursor-not-allowed'
                                     : ''
                                 }`}>
            <Plus className='w-5 h-5' />
            Create Research
          </motion.button>
        </motion.div>

        {/* Add Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 relative'>
          <div className='flex space-x-2 p-1 bg-gray-800/30 rounded-xl backdrop-blur-sm w-fit mx-auto'>
            <button
              onClick={() => handleTabChange('ongoing')}
              disabled={isProjectLoading || isTabChanging || isContributing}
              className={`relative px-6 py-2 rounded-lg transition-all duration-300 
                                    ${
                                      activeTab === 'ongoing'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }
                                    ${
                                      isProjectLoading ||
                                      isTabChanging ||
                                      isContributing
                                        ? 'cursor-not-allowed'
                                        : ''
                                    }`}>
              {activeTab === 'ongoing' && (
                <motion.div
                  layoutId='tab-highlight'
                  className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg'
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className='relative z-10'>Ongoing Projects</span>
            </button>
            <button
              onClick={() => handleTabChange('expired')}
              disabled={isProjectLoading || isTabChanging || isContributing}
              className={`relative px-6 py-2 rounded-lg transition-all duration-300 
                                    ${
                                      activeTab === 'expired'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }
                                    ${
                                      isProjectLoading ||
                                      isTabChanging ||
                                      isContributing
                                        ? 'cursor-not-allowed'
                                        : ''
                                    }`}>
              {activeTab === 'expired' && (
                <motion.div
                  layoutId='tab-highlight'
                  className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg'
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className='relative z-10'>Expired Projects</span>
            </button>
          </div>
        </motion.div>

        {/* Project Loading State */}
        <AnimatePresence>
          {(isProjectLoading || isTabChanging) && <ProjectFetchingLoader />}
        </AnimatePresence>

        {/* Research Cards Grid - Only show when not loading */}
        {!isProjectLoading && !isTabChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {researchData
              .filter((research) => {
                const now = Math.floor(Date.now() / 1000)
                const isExpired = research.deadlineInSeconds < now
                return activeTab === 'ongoing' ? !isExpired : isExpired
              })
              .map((research, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout>
                  <ResearchCard
                    research={research}
                    contributionAmount={contributionAmounts[research.id]}
                    onContributionChange={(value) =>
                      setContributionAmounts((prev) => ({
                        ...prev,
                        [research.id]: value,
                      }))
                    }
                    onContribute={() => handleContribute(research.id)}
                    isContributing={
                      isContributing && contributingProjectId === research.id
                    }
                    disabled={isContributing}
                  />
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Empty State - Modified - Only show when not loading */}
        {!isProjectLoading &&
          !isTabChanging &&
          researchData.filter((research) => {
            const now = Math.floor(Date.now() / 1000)
            const isExpired = research.deadlineInSeconds < now
            return activeTab === 'ongoing' ? !isExpired : isExpired
          }).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-center py-32'>
              <Sparkles className='w-16 h-16 text-purple-500/50 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-300'>
                {activeTab === 'ongoing'
                  ? 'No Ongoing Research Projects'
                  : 'No Expired Research Projects'}
              </h3>
              <p className='text-gray-500 mt-2 mb-8'>
                {activeTab === 'ongoing'
                  ? 'Create a new research project to get started.'
                  : 'Previous projects will appear here once they expire.'}
              </p>
              {activeTab === 'ongoing' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                  disabled={isContributing}
                  className={`px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl 
                                     border border-purple-500/20 text-purple-400 hover:bg-gradient-to-r 
                                     hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300
                                     ${
                                       isContributing
                                         ? 'opacity-50 cursor-not-allowed'
                                         : ''
                                     }`}>
                  Create First Project
                </motion.button>
              )}
            </motion.div>
          )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className='bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-2xl shadow-2xl 
                                         w-full max-w-md border border-purple-400/20 relative overflow-hidden'>
                {/* Modal Background Effects */}
                <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]' />
                <div className='absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl' />
                <div className='absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl' />

                <div className='relative'>
                  <h2 className='text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2'>
                    <FileText className='w-6 h-6' />
                    Create Research
                  </h2>
                  <div className='space-y-6'>
                    <div>
                      <label className='text-sm text-gray-400 mb-1 block'>
                        Title
                      </label>
                      <input
                        type='text'
                        name='title'
                        value={newResearch.title}
                        onChange={handleInputChange}
                        placeholder='Enter research title'
                        className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                      />
                    </div>

                    <div>
                      <label className='text-sm text-gray-400 mb-1 block'>
                        Description
                      </label>
                      <textarea
                        name='description'
                        value={newResearch.description}
                        onChange={handleInputChange}
                        placeholder='Enter research description'
                        rows='4'
                        className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                      />
                    </div>

                    <div>
                      <label className='text-sm text-gray-400 mb-1 block'>
                        Funding Amount
                      </label>
                      <div className='relative'>
                        <Coins className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                        <input
                          type='text'
                          name='amount'
                          value={newResearch.amount}
                          onChange={handleInputChange}
                          placeholder='e.g., 10 ETH'
                          className='w-full p-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='text-sm text-gray-400 mb-1 block'>
                        Deadline
                      </label>
                      <div className='relative'>
                        <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                        <input
                          type='date'
                          name='deadline'
                          value={newResearch.deadline}
                          onChange={handleInputChange}
                          className='w-full p-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end mt-8 gap-3'>
                    <button
                      onClick={() => setShowModal(false)}
                      className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'>
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateResearch}
                      className='px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2'>
                      <FileText className='w-5 h-5' />
                      Create
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Page
