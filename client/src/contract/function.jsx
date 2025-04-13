import { useReadContract,useWriteContract, useReadContracts, } from 'wagmi'
import { collabAddress } from '@/contract/contract'
import { collabABI } from '@/contract/contract'
import { desciAddress } from '@/contract/contract'
import { desciABI } from '@/contract/contract'
import { companyABI } from '@/contract/contract'
import { companyAddress } from '@/contract/contract'
import { escrowABI } from '@/contract/contract'
import { escrowAddress } from '@/contract/contract'


export const createProfile = async(profileURI)=>{
    try {
        const {writeContract} = useWriteContract()
        const tx = writeContract({
            address:companyAddress,
            abi:companyABI,
            functionName:'createProfile',
            args: [profileURI]
        })
        await tx.wait()
        console.log("Transaction Successful")
        return true;
        
    } catch (error) {
        console.log(error)
        return false;
        
    }
}
export const createCommunity =async(companyURI)=>{
    try {
        const {writeContract} = useWriteContract()
        const tx = writeContract({
            address:companyAddress,
            abi:companyABI,
            functionName:'createCompany',
            args: [companyURI]
        })
        console.log("Transaction Successful")
        
    } catch (error) {
        console.log(error)
        
    }

}
export const joinCompany = async(communityId)=>{
    try {
        const {writeContract} = useWriteContract()
        const  tx = writeContract({
            address:companyAddress,
            abi:companyABI,
            functionName:'joinCompany',
            args: [communityId]

        })
        console.log("Transaction Successful")  
          
    } catch (error) {
        console.log(error)        
    }
}

export const raiseProposal = async (companyId, description, researchURI) => {
    try {
        const {writeContract} = useWriteContract()
        const tx = writeContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'raiseProposal',
            args: [companyId, description, researchURI]
        })
        console.log("Proposal raised successfully")
    } catch (error) {
        console.error("Error raising proposal:", error)
        throw error
    }
}

export const voteOnProposal = async (proposalId, inFavor) => {
    try {
        const {writeContract} = useWriteContract()
        const tx = writeContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'voteOnProposal',
            args: [proposalId, inFavor]
        })
        console.log("Vote cast successfully")
    } catch (error) {
        console.error("Error casting vote:", error)
        throw error
    }
}

// Helper functions for reading data
export const getProposal = async (proposalId) => {
    try {
        const data = useReadContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'getProposal',
            args: [proposalId]
        })
        return {
            description: data[0],
            proposer: data[1],
            votesFor: data[2],
            votesAgainst: data[3],
            approved: data[4],
            researchURI: data[5]
        }
    } catch (error) {
        console.error("Error fetching proposal:", error)
        throw error
    }
}

export const getCompanyOfProposal = async (proposalId) => {
    try {
        const data = useReadContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'getCompanyOfProposal',
            args: [proposalId]
        })
        return data
    } catch (error) {
        console.error("Error fetching company of proposal:", error)
        throw error
    }
}


// ...existing code...

export const getCompany = async (companyId) => {
    try {
        const data = useReadContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'getCompany',
            args: [companyId]
        })
        return {
            id: data[0],
            name: data[1],
            owner: data[2],
            proposals: data[3],
            researchList: data[4]
        }
    } catch (error) {
        console.error("Error fetching company:", error)
        throw error
    }
}

export const getProfile = async (userAddress) => {
    try {
        const data = useReadContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'getProfile',
            args: [userAddress]
        })
        return {
            userId: data[0],
            profileURI: data[1]
        }
    } catch (error) {
        console.error("Error fetching profile:", error)
        throw error
    }
}

export const getUserId = async (userAddress) => {
    try {
        const data = useReadContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'getUserId',
            args: [userAddress]
        })
        return data
    } catch (error) {
        console.error("Error fetching user ID:", error)
        throw error
    }
}

export const isMemberOfCompany = async (companyId, userId) => {
    try {
        const data = useReadContract({
            address: companyAddress,
            abi: companyABI,
            functionName: 'isMemberOfCompany',
            args: [companyId, userId]
        })
        return data
    } catch (error) {
        console.error("Error checking company membership:", error)
        throw error
    }
}

export const startResearchCrowdfunding = async (title, targetAmount, duration) => {
    try {
        const tx = writeContract({
            address: escrowAddress,
            abi: escrowABI,
            functionName: 'startResearchCrowdfunding',
            args: [title, targetAmount, duration]
        })
        console.log("Research crowdfunding started successfully")
        return tx
    } catch (error) {
        console.error("Error starting crowdfunding:", error)
        throw error
    }
}

export const contributeToResearch = async (projectId, amount) => {
    try {
        const tx =  writeContract({
            address: escrowAddress,
            abi: escrowABI,
            functionName: 'contributeToResearch',
            args: [projectId],
            value: amount
        })
        console.log("Contribution successful")
        return tx
    } catch (error) {
        console.error("Error contributing to research:", error)
        throw error
    }
}

export const releaseFunds = async (projectId) => {
    try {
        const tx = writeContract({
            address: escrowAddress,
            abi: escrowABI,
            functionName: 'releaseFunds',
            args: [projectId]
        })
        console.log("Funds released successfully")
        return tx
    } catch (error) {
        console.error("Error releasing funds:", error)
        throw error
    }
}

export const claimRefund = async (projectId) => {
    try {
        const tx = writeContract({
            address: escrowAddress,
            abi: escrowABI,
            functionName: 'claimRefund',
            args: [projectId]
        })
        console.log("Refund claimed successfully")
        return tx
    } catch (error) {
        console.error("Error claiming refund:", error)
        throw error
    }
}

export const getResearchProject = async (projectId) => {
    try {
        const data = useReadContract({
            address: escrowAddress,
            abi: escrowABI,
            functionName: 'getResearchProject',
            args: [projectId]
        })
        return {
            title: data[0],
            creator: data[1],
            targetAmount: data[2],
            currentAmount: data[3],
            deadline: data[4],
            funded: data[5],
            fundsReleased: data[6]
        }
    } catch (error) {
        console.error("Error fetching research project:", error)
        throw error
    }
}

export const getUserContribution = async (projectId, userAddress) => {
    try {
        const data = useReadContract({
            address: escrowAddress,
            abi: escrowABI,
            functionName: 'getUserContribution',
            args: [projectId, userAddress]
        })
        return data
    } catch (error) {
        console.error("Error fetching user contribution:", error)
        throw error
    }
}

// ...existing code...

export const createResearch = async (title, metadataURI) => {
    try {
        const tx =  writeContract({
            address: collabAddress,
            abi: collabABI,
            functionName: 'createResearch',
            args: [title, metadataURI]
        })
        console.log("Research created successfully")
        return tx
    } catch (error) {
        console.error("Error creating research:", error)
        throw error
    }
}

export const updateResearch = async (tokenId, newMetadataURI) => {
    try {
        const tx = writeContract({
            address: collabAddress,
            abi: collabABI,
            functionName: 'updateResearch',
            args: [tokenId, newMetadataURI]
        })
        console.log("Research updated successfully")
        return tx
    } catch (error) {
        console.error("Error updating research:", error)
        throw error
    }
}

export const getLatestResearch = async (tokenId) => {
    try {
        const data = useReadContract({
            address: collabAddress,
            abi: collabABI,
            functionName: 'getLatestResearch',
            args: [tokenId]
        })
        return {
            title: data[0],
            metadataURI: data[1],
            currentVersion: data[2]
        }
    } catch (error) {
        console.error("Error fetching latest research:", error)
        throw error
    }
}

export const getResearchVersion = async (tokenId, version) => {
    try {
        const data = useReadContract({
            address: collabAddress,
            abi: collabABI,
            functionName: 'getResearchVersion',
            args: [tokenId, version]
        })
        return data
    } catch (error) {
        console.error("Error fetching research version:", error)
        throw error
    }
}

export const assignCollaborator = async (tokenId, collaborator, expires) => {
    try {
        const tx = writeContract({
            address: collabAddress,
            abi: collabABI,
            functionName: 'assignCollaborator',
            args: [tokenId, collaborator, expires]
        })
        console.log("Collaborator assigned successfully")
        return tx
    } catch (error) {
        console.error("Error assigning collaborator:", error)
        throw error
    }
}

export const getCollaborations = async (userAddress) => {
    try {
        const data =  useReadContract({
            address: collabAddress,
            abi: collabABI,
            functionName: 'getCollaborations',
            args: [userAddress]
        })
        return data
    } catch (error) {
        console.error("Error fetching collaborations:", error)
        throw error
    }
}

export const isOwnerOrCollaborator = async (tokenId, account) => {
    try {
        const data =  useReadContract({
            address: collabAddress,
            abi: collabABI,
            functionName: '_isOwnerOrCollaborator',
            args: [tokenId, account]
        })
        return data
    } catch (error) {
        console.error("Error checking ownership/collaboration:", error)
        throw error
    }
}



