import { useReadContract, useWriteContract, useReadContracts } from "wagmi";
import { collabAddress } from "@/contract/contract";
import { collabABI } from "@/contract/contract";
import { desciAddress } from "@/contract/contract";
import { desciABI } from "@/contract/contract";
import { companyABI } from "@/contract/contract";
import { companyAddress } from "@/contract/contract";
import { escrowABI } from "@/contract/contract";
import { escrowAddress } from "@/contract/contract";


export const getTotalFundingConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "nextProjectId"
}
export const createProfileConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "createProfile"
};

export const createCompanyConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "createCompany"
};

export const joinCompanyConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "joinCompany"
};

export const raiseProposalConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "raiseProposal"
};

export const voteOnProposalConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "voteOnProposal"
};

export const getProposalConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "getProposal"
};

export const getCompanyOfProposalConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "getCompanyOfProposal"
};

export const getCompanyConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "getCompany"
};

export const getProfileConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "getProfile"
};

export const getUserIdConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "getUserId"
};

export const isMemberOfCompanyConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "isMemberOfCompany"
};

export const startResearchCrowdfundingConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "startResearchCrowdfunding"
};

export const contributeToResearchConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "contributeToResearch",
};

export const releaseFundsConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "releaseFunds"
};

export const claimRefundConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "claimRefund"
};

export const getResearchProjectConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "getResearchProject"
};

export const getUserContributionConfig = {
  address: escrowAddress,
  abi: escrowABI,
  functionName: "getUserContribution"
};

export const createResearchConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "createResearch"
};

export const updateResearchConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "updateResearch"
};

export const getLatestResearchConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "getLatestResearch"
};

export const getResearchVersionConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "getResearchVersion"
};

export const assignCollaboratorConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "assignCollaborator"
};

export const getCollaborationsConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "getCollaborations"
};

export const isOwnerOrCollaboratorConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "_isOwnerOrCollaborator"
};

export const totalCompaniesConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "nextCompanyId"
}

export const totalProposalsConfig = {
  address: companyAddress,
  abi: companyABI,
  functionName: "nextProposalId"
}

export const totalResearchesConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "_nextTokenId"
}

export const checkOwnerConfig = {
  address: collabAddress,
  abi: collabABI,
  functionName: "ownerOf"
}


