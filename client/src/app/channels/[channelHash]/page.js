'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import {
  Check,
  Loader2,
  FileText,
  Upload,
  PlusCircle,
  X,
  AlertCircle,
  ThumbsUp,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAccount, useConfig } from 'wagmi'
import {
  readContract,
  readContracts,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'
import {
  getCompanyConfig,
  getCompanyOfProposalConfig,
  getProposalConfig,
  isMemberOfCompanyConfig,
  joinCompanyConfig,
  raiseProposalConfig,
  totalProposalsConfig,
  voteOnProposalConfig,
} from '@/contract/function'
import { getJsonFromIpfs, uploadToIpfs, uploadToIpfsJson } from '@/contract'
import { useWalletContext } from '@/context/WalletContext'
import Loader from '@/components/loader'

const ProposalSkeleton = () => (
  <div className='bg-gray-900/50 border border-purple-400/10 rounded-xl p-6 backdrop-blur-sm overflow-hidden space-y-4'>
    <div className='flex items-center gap-3 mb-4'>
      <div className='w-10 h-10 rounded-full bg-gradient-to-r from-gray-800/80 to-gray-700/80 animate-pulse'></div>
      <div>
        <div className='h-4 w-48 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded animate-pulse mb-2'></div>
        <div className='h-3 w-24 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded animate-pulse'></div>
      </div>
    </div>
    <div className='space-y-2'>
      <div className='h-5 w-3/4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded animate-pulse'></div>
      <div className='h-4 w-full bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded animate-pulse'></div>
      <div className='h-4 w-5/6 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded animate-pulse'></div>
      <div className='h-4 w-1/2 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded animate-pulse'></div>
    </div>
    <div className='flex justify-between items-center pt-4'>
      <div className='h-3 w-32 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded animate-pulse'></div>
      <div className='h-9 w-24 bg-gradient-to-r from-purple-700/30 to-pink-700/30 rounded-full animate-pulse'></div>
    </div>
  </div>
)

// Loading spinner component
const LoadingSpinner = ({ size = 'w-5 h-5', className = '' }) => (
  <Loader2 className={`animate-spin ${size} ${className}`} />
)

const ChannelPage = () => {
  const router = useRouter()
  const { channelHash } = useParams()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [proposalLoading, setProposalLoading] = useState(true)
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [votingProposals, setVotingProposals] = useState({})
  const [tabChanging, setTabChanging] = useState(false)
  const [backNavigating, setBackNavigating] = useState(false)
  const [channel, setChannel] = useState(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [proposals, setProposals] = useState([])
  const { profileData, isLoading: profileLoading } = useWalletContext()
  const fileInputRef = useRef(null)
  const config = useConfig()
  const { address } = useAccount()
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    document: null,
    documentName: '',
  })

  // Navigation with loading state
  const handleBackNavigation = () => {
    setBackNavigating(true)
    router.push('/channels')
  }

  const checkJoined = async () => {
    try {
      if (address) {
        const joined = await readContract(config, {
          ...isMemberOfCompanyConfig,
          args: [channelHash, Number(profileData[0])],
        })
        return joined
      }
    } catch (e) {
      console.log('Joining Status Error : ', e)
      toast.error(e.message || e.details || 'Failed to check joining status')
      return false
    }
  }

  const fetchProposals = async (proposalIds) => {
    try {
      setProposalLoading(true)

      // Display loading state first
      if (proposals.length === 0) {
        // Create placeholder skeletons while loading
        setProposals(Array(proposalIds.length || 2).fill({ isLoading: true }))
      }

      const proposalConfigs = proposalIds.map((id) => {
        return {
          ...getProposalConfig,
          args: [Number(id)],
        }
      })

      if (!proposalConfigs || proposalConfigs.length === 0) {
        setProposalLoading(false)
        setProposals([])
        return
      }

      const proposalsData = await readContracts(config, {
        contracts: proposalConfigs,
      })
      console.log('Proposals Data : ', proposalsData)
      const updProposals = await Promise.all(
        proposalsData.map(async (proposalD, index) => {
          const proposal = proposalD.result
          const { title, docLink } = await getJsonFromIpfs(proposal[5])
          return {
            id: Number(proposalIds[index]),
            title,
            description: proposal[0],
            createdBy: proposal[1],
            votes: Number(proposal[2]),
            maxVotes: Number(proposal[3]) || 1,
            isApproved: proposal[4],
            docLink,
          }
        })
      )

      console.log('Proposals Data : ', updProposals)
      setProposals(updProposals)
    } catch (e) {
      console.log('Error fetching proposals : ', e)
      setProposals([])
    } finally {
      setProposalLoading(false)
    }
  }

  const fetchCompany = async () => {
    try {
      const channelContractData = await readContract(config, {
        ...getCompanyConfig,
        args: [Number(channelHash)],
      })
      console.log('Channel Contract Data : ', channelContractData)
      if (!channelContractData) {
        router.push('/channels')
        return
      }

      // Start proposal loading for better UX
      setProposalLoading(true)

      // Load channel data first
      const channelData = await getJsonFromIpfs(channelContractData[1])
      const channelD = { ...channelData, proposalIds: channelContractData[3] }
      setChannel(channelD)

      // Then load proposals
      await fetchProposals(channelContractData[3])
    } catch (e) {
      throw new Error('Error fetching channel data')
    }
  }

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setIsLoading(true)
        setProposalLoading(true)

        if (channelHash === '') {
          router.push('/channels')
          return
        }

        await fetchCompany()
        const joined = await checkJoined()
        setHasJoined(joined)
        setIsLoading(false)
      } catch (error) {
        toast.error('Failed to load channel data')
        router.push('/channels')
        setIsLoading(false)
      }
    }

    if (profileData && profileData.length > 0) {
      fetchChannelData()
    }
  }, [channelHash, router, profileData])

  // Handle tab change with loading state
  const handleTabChange = (tab) => {
    setTabChanging(true)
    setActiveTab(tab)
    // Simulate a slight delay for better UX
    setTimeout(() => {
      setTabChanging(false)
    }, 300)
  }

  const handleJoinChannel = async () => {
    setJoining(true)
    try {
      if (channelHash && profileData && profileData.length > 0) {
        const txr = await writeContract(config, {
          ...joinCompanyConfig,
          args: [channelHash],
        })
        if (!txr) {
          toast.error('Transaction refused')
          return
        }

        // Show toast while waiting for transaction
        const loadingToast = toast.loading('Processing your request...')

        await waitForTransactionReceipt(config, {
          hash: txr,
        })

        toast.dismiss(loadingToast)

        const joiningStatus = await checkJoined()
        if (joiningStatus) {
          toast.success('Joined the channel successfully')
          setHasJoined(true)
        } else {
          toast.error('Failed to join the channel')
        }
      }
    } catch (e) {
      toast.error(e.message || e.details || 'Failed to join channel')
    } finally {
      setJoining(false)
    }
  }

  // Handle proposal form changes
  const handleProposalInputChange = (e) => {
    const { name, value } = e.target
    setProposalForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle document upload
  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show file loading indicator
    setProposalForm((prev) => ({
      ...prev,
      documentLoading: true,
    }))

    // Read file with a short delay to show loading state
    setTimeout(() => {
      setProposalForm((prev) => ({
        ...prev,
        document: file,
        documentName: file.name,
        documentLoading: false,
      }))
    }, 500)
  }

  // Handle proposal submission
  const handleProposalSubmit = async (e) => {
    e.preventDefault()
    setSubmittingProposal(true)
    let proposalToast = null
    try {
      const { title, description, document } = proposalForm
      if (!title || !description || !document) {
        toast.error('Please fill in all required fields')
        setSubmittingProposal(false)
        return
      }

      // Show uploading toast
      proposalToast = toast.loading('Uploading document to IPFS...')

      const docLink = await uploadToIpfs(document)

      toast.dismiss(proposalToast)
      proposalToast = toast.loading('Preparing proposal metadata...')

      const proposalUri = await uploadToIpfsJson({ title, docLink })

      toast.dismiss(proposalToast)
      proposalToast = toast.loading('Submitting proposal to blockchain...')

      const txr = await writeContract(config, {
        ...raiseProposalConfig,
        args: [channelHash, description, proposalUri],
      })

      await waitForTransactionReceipt(config, {
        hash: txr,
      })

      toast.dismiss(proposalToast)
      toast.success('Proposal submitted successfully')
      setShowProposalModal(false)
      // Refresh data
      await fetchCompany()
      setProposalForm({
        title: '',
        description: '',
        document: null,
        documentName: '',
      })
    } catch (e) {
      if (proposalToast) toast.dismiss(proposalToast)
      console.log(e)
      toast.error('Error submitting proposal')
    } finally {
      setShowProposalModal(false)
      setSubmittingProposal(false)
    }
  }

  // Handle vote on proposal
  const handleVoteProposal = async (proposalId) => {
    // Set this specific proposal to loading state
    setVotingProposals((prev) => ({
      ...prev,
      [proposalId]: true,
    }))
    let votingToast = null
    try {
      console.log('Proposal ID : ', proposalId)

      votingToast = toast.loading('Processing your vote...')

      const txr = await writeContract(config, {
        ...voteOnProposalConfig,
        args: [Number(proposalId), true],
      })

      await waitForTransactionReceipt(config, {
        hash: txr,
      })

      toast.dismiss(votingToast)
      toast.success('Voted successfully')
      setProposalLoading(true)
      await fetchCompany()
    } catch (e) {
      if (votingToast) toast.dismiss(votingToast)
      console.log('Error voting on proposal : ', e)
      toast.error('Failed to vote on proposal')
    } finally {
      setVotingProposals((prev) => ({
        ...prev,
        [proposalId]: false,
      }))
    }
  }

  // Filter proposals based on active tab
  const filteredProposals = proposals.filter(
    (proposal) =>
      proposal.isLoading ||
      (activeTab === 'approved' ? proposal.isApproved : !proposal.isApproved)
  )

  // Back button with loading state
  const BackButton = () => (
    <button
      onClick={handleBackNavigation}
      disabled={backNavigating}
      className={`flex items-center gap-2 text-gray-400 hover:text-white transition-all group absolute top-4 left-4 z-10 bg-black/30 backdrop-blur-sm py-2 px-4 rounded-full ${
        backNavigating ? 'opacity-70' : ''
      }`}>
      {backNavigating ? (
        <LoadingSpinner size='w-4 h-4' />
      ) : (
        <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
      )}
      <span>Back to Channels</span>
    </button>
  )

  // Loading state
  if (profileLoading || !profileData || profileData.length === 0) {
    return <Loader />
  }
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-950'>
        <div className='relative w-20 h-20 mb-6'>
          <div className='absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin'></div>
          <div
            className='absolute inset-3 rounded-full border-t-4 border-pink-500 border-opacity-70 animate-spin'
            style={{
              animationDirection: 'reverse',
              animationDuration: '1.5s',
            }}></div>
        </div>
        <p className='text-xl flex flex-row font-medium gap-x-2 text-purple-400'>
          <LoadingSpinner />
          {' Loading Channel...'}
        </p>
      </div>
    )
  }

  // If channel is not found
  if (!channel) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6'>
        <AlertCircle className='w-16 h-16 text-red-400 mb-4' />
        <h2 className='text-2xl font-bold text-white mb-2'>
          Channel Not Found
        </h2>
        <p className='text-gray-400 mb-6 text-center max-w-md'>
          {
            'The channel you&apos;re looking for doesn&apos;t exist or may have been removed.'
          }
        </p>
        <Button
          onClick={handleBackNavigation}
          disabled={backNavigating}
          className='bg-purple-600 hover:bg-purple-700 flex items-center gap-2'>
          {backNavigating ? <LoadingSpinner /> : null}
          Go to Channels
        </Button>
      </div>
    )
  }

  return (
    <div className='mt-20 min-h-screen bg-gray-950'>
      {/* Back Button */}
      <BackButton />

      {/* Banner and Profile Section */}
      <div className='relative'>
        {/* Banner Image */}
        <div className='relative h-64 md:h-80 w-full overflow-hidden'>
          {channel.bannerImage ? (
            <Image
              src={channel.bannerImage}
              alt={`${channel.title} banner`}
              fill
              priority
              className='object-cover'
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-r from-purple-900 to-pink-900' />
          )}
          <div className='absolute inset-0 bg-black opacity-40' />
        </div>

        {/* Profile and Channel Info */}
        <div className='container max-w-6xl mx-auto px-6'>
          <div className='relative -mt-20 bg-gray-900/80 backdrop-blur-md rounded-xl border border-purple-400/30 shadow-xl p-6 mb-10'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
              {/* Profile Icon */}
              <div className='w-24 h-24 rounded-full overflow-hidden border-4 border-gray-900 bg-purple-600 flex-shrink-0 shadow-lg'>
                {channel.profileIcon ? (
                  <Image
                    src={channel.profileIcon}
                    alt={channel.title}
                    width={96}
                    height={96}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <FileText className='w-12 h-12 text-white' />
                  </div>
                )}
              </div>

              {/* Channel Info */}
              <div className='flex-1'>
                <h1 className='text-3xl font-bold text-white mb-2'>
                  {channel.title}
                </h1>
                <p className='text-gray-300 mb-4'>{channel.description}</p>

                {/* Join Button with loading state */}
                {!hasJoined ? (
                  <Button
                    onClick={handleJoinChannel}
                    disabled={joining}
                    className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all transform hover:scale-[1.02] flex items-center gap-2'>
                    {joining ? <LoadingSpinner /> : null}
                    {joining ? 'Joining...' : 'Join Channel'}
                  </Button>
                ) : (
                  <div className='flex items-center text-green-400'>
                    <Check className='w-5 h-5 mr-2' />
                    <span>Member</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals Section */}
      <div className='container max-w-6xl mx-auto px-6 pb-20'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <h2 className='text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text'>
            Research Proposals
          </h2>

          {hasJoined && (
            <Button
              onClick={() => setShowProposalModal(true)}
              className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2'>
              <PlusCircle className='w-5 h-5' />
              Raise New Proposal
            </Button>
          )}
        </div>

        {/* Only show proposals if user has joined */}
        {hasJoined ? (
          <>
            {/* Tabs with loading state */}
            <div className='flex space-x-2 mb-6'>
              <button
                onClick={() => handleTabChange('pending')}
                disabled={tabChanging || activeTab === 'pending'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'pending'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {tabChanging && activeTab === 'pending' ? (
                  <LoadingSpinner size='w-3 h-3' />
                ) : null}
                Pending
              </button>
              <button
                onClick={() => handleTabChange('approved')}
                disabled={tabChanging || activeTab === 'approved'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'approved'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {tabChanging && activeTab === 'approved' ? (
                  <LoadingSpinner size='w-3 h-3' />
                ) : null}
                Approved
              </button>
            </div>

            {/* Proposals List with loading states */}
            {proposalLoading ? (
              <div className='grid grid-cols-1 gap-6'>
                {[1, 2].map((i) => (
                  <ProposalSkeleton key={i} />
                ))}
              </div>
            ) : filteredProposals.length > 0 ? (
              <div className='grid grid-cols-1 gap-6'>
                <AnimatePresence mode='wait'>
                  {filteredProposals.map((proposal) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}>
                      {proposal.isLoading ? (
                        <ProposalSkeleton />
                      ) : (
                        <Card className='bg-gray-900/50 border border-purple-400/20 hover:border-purple-400/40 transition-all p-6 backdrop-blur-sm'>
                          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                            <div className='flex-1'>
                              <h3 className='text-xl font-bold text-white mb-2'>
                                {proposal.title}
                              </h3>
                              <p className='text-gray-300 mb-4'>
                                {proposal.description}
                              </p>
                              <div className='flex items-center text-gray-400 text-sm'>
                                <span>Proposed by {proposal.createdBy}</span>
                              </div>
                            </div>

                            <div className='flex flex-col items-end gap-4'>
                              {/* Vote Button with loading state */}
                              {!proposal.isApproved &&
                                address !== proposal.createdBy && (
                                  <Button
                                    onClick={() =>
                                      handleVoteProposal(proposal.id)
                                    }
                                    className='bg-purple-600 hover:bg-purple-700 text-white px-8 flex items-center gap-2'
                                    disabled={
                                      proposal.votes >= proposal.maxVotes ||
                                      votingProposals[proposal.id]
                                    }>
                                    {votingProposals[proposal.id] ? (
                                      <LoadingSpinner />
                                    ) : (
                                      <ThumbsUp className='w-4 h-4 mr-2' />
                                    )}
                                    {votingProposals[proposal.id]
                                      ? 'Voting...'
                                      : 'Vote'}
                                  </Button>
                                )}

                              {/* Vote Progress */}
                              <div className='w-full max-w-[200px]'>
                                <div className='flex justify-between text-xs mb-1'>
                                  <span className='text-gray-400'>
                                    Votes: {proposal.votes}/{proposal.maxVotes}
                                  </span>
                                  {proposal.isApproved && (
                                    <span className='text-green-400 flex items-center'>
                                      <Check className='w-3 h-3 mr-1' />
                                      Approved
                                    </span>
                                  )}
                                </div>
                                <div className='w-full bg-gray-800 rounded-full h-2 overflow-hidden'>
                                  <div
                                    className={`h-full rounded-full ${
                                      proposal.isApproved
                                        ? 'bg-green-500'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    }`}
                                    style={{
                                      width: `${
                                        (proposal.votes / proposal.maxVotes) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Document link if available */}
                          {proposal.docLink && (
                            <div className='mt-4 pt-4 border-t border-gray-700/30'>
                              <a
                                href={proposal.docLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center text-purple-400 hover:text-purple-300 gap-2 text-sm'>
                                <FileText className='w-4 h-4' />
                                <span>View Document</span>
                                <ExternalLink className='w-3 h-3' />
                              </a>
                            </div>
                          )}
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-16 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20'>
                <FileText className='w-16 h-16 text-gray-500 mb-4' />
                <h3 className='text-xl font-semibold text-gray-300 mb-2'>
                  No {activeTab} proposals
                </h3>
                <p className='text-gray-400 mb-6'>
                  {activeTab === 'pending'
                    ? 'Be the first to propose a new research idea for this channel.'
                    : 'There are no approved proposals yet.'}
                </p>
                {activeTab === 'pending' && (
                  <Button
                    onClick={() => setShowProposalModal(true)}
                    className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2'>
                    <PlusCircle className='w-4 h-4 mr-2' />
                    New Proposal
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20'>
            <FileText className='w-16 h-16 text-gray-500 mb-4' />
            <h3 className='text-xl font-semibold text-gray-300 mb-2'>
              Join to view proposals
            </h3>
            <p className='text-gray-400 mb-6'>
              You need to join this channel to view and create proposals.
            </p>
            <Button
              onClick={handleJoinChannel}
              disabled={joining}
              className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2'>
              {joining ? <LoadingSpinner /> : null}
              {joining ? 'Joining...' : 'Join Channel'}
            </Button>
          </div>
        )}
      </div>

      {/* New Proposal Modal with loading states */}
      {showProposalModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='w-full max-w-2xl bg-gray-900 border border-purple-400/30 rounded-xl shadow-xl overflow-hidden'>
            <div className='p-6 border-b border-purple-400/20 flex justify-between items-center'>
              <h2 className='text-xl font-bold text-purple-400 flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                New Research Proposal
              </h2>
              <button
                onClick={() => setShowProposalModal(false)}
                disabled={submittingProposal}
                className='text-gray-400 hover:text-white transition-colors'>
                <X className='w-5 h-5' />
              </button>
            </div>

            <form
              onSubmit={handleProposalSubmit}
              className='p-6'>
              <div className='space-y-6'>
                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>
                    Proposal Title*
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={proposalForm.title}
                    onChange={handleProposalInputChange}
                    placeholder='Enter proposal title'
                    className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all'
                    required
                    disabled={submittingProposal}
                  />
                </div>

                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>
                    Proposal Description*
                  </label>
                  <textarea
                    name='description'
                    value={proposalForm.description}
                    onChange={handleProposalInputChange}
                    placeholder='Detailed description of your research proposal'
                    rows={5}
                    className='w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none'
                    required
                    disabled={submittingProposal}
                  />
                </div>

                <div>
                  <label className='text-sm text-gray-400 mb-1 block'>
                    Supporting Document (PDF) *
                  </label>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf'
                    onChange={handleDocumentChange}
                    className='hidden'
                    disabled={submittingProposal}
                  />

                  <div
                    onClick={() =>
                      !submittingProposal && fileInputRef.current?.click()
                    }
                    className={`p-4 border border-dashed ${
                      submittingProposal
                        ? 'border-gray-700 cursor-not-allowed'
                        : 'border-gray-600 cursor-pointer hover:bg-gray-800/50'
                    } rounded-lg bg-gray-800/30 transition-colors flex flex-col items-center justify-center`}>
                    {proposalForm.documentLoading ? (
                      <div className='flex flex-col items-center'>
                        <LoadingSpinner
                          size='w-8 h-8 mb-2'
                          className='text-gray-500'
                        />
                        <p className='text-gray-400'>
                          {'Processing document...'}
                        </p>
                      </div>
                    ) : proposalForm.document ? (
                      <div className='flex items-center justify-center gap-2 text-purple-400'>
                        <FileText className='w-5 h-5' />
                        <span>{proposalForm.documentName}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className='w-8 h-8 mb-2 text-gray-500' />
                        <p className='text-gray-400'>
                          Click to upload PDF document
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className='mt-8 flex justify-end gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowProposalModal(false)}
                  disabled={submittingProposal}
                  className='border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={submittingProposal}
                  className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 flex items-center gap-2'>
                  {submittingProposal ? <LoadingSpinner /> : null}
                  {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ChannelPage
