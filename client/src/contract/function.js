import { useReadContract,useWriteContract, useReadContracts } from 'wagmi'
import { collabAddress } from '@/contract/contract'
import { collabABI } from '@/contract/contract'
import { desciAddress } from '@/contract/contract'
import { desciABI } from '@/contract/contract'
import { companyABI } from '@/contract/contract'
import { companyAddress } from '@/contract/contract'
import { escrowABI } from '@/contract/contract'
import { escrowAddress } from '@/contract/contract'

const {writeContract} = useWriteContract()

export const createProfile = async(profileURI)=>{
    try {
        const tx = writeContract({
            address:companyAddress,
            abi:companyABI,
            functionName:'createProfile',
            args: [profileURI]
        })
        console.log("Transaction Successful")
        
    } catch (error) {
        console.log(error)
        
    }
}
export const createCommunity =async(companyURI)=>{
    try {
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