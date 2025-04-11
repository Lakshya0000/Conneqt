// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./DeSciToken.sol";
import "./ResearchCollab.sol";

contract ResearchCompany is Ownable {
    struct Profile {
        string profileURI;
    }

    struct Company {
        uint256 id;
        string name;
        address owner;
        uint256[] proposals;
        uint256[] researchList;
    }

    struct Proposal {
        string description;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        bool approved;
    }

    uint256 private nextCompanyId;
    uint256 private nextProposalId;
    uint256 private nextUserId;

    mapping(uint256 => Profile) public profiles;
    mapping(uint256 => Company) public companies;
    mapping(uint256 => mapping(uint256 => bool)) public companyMembers;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => string) public proposalResearchURI; // Separate mapping for researchURI
    mapping(address => uint256) public userAddressToId;
    mapping(uint256 => mapping(uint256 => bool)) public hasUserVoted; // proposalId -> userId -> hasVoted
    
    DeSciToken public desciToken;
    ResearchCollab public researchCollab;
    
    uint256 public proposalCreationReward = 30 * 10**18;
    uint256 public votingReward = 10 * 10**18;
    
    event CompanyCreated(uint256 indexed companyId, string name, address owner);
    event JoinedCompany(uint256 indexed userId, uint256 indexed companyId);
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed companyId, string description, address proposer);
    event Voted(uint256 indexed proposalId, uint256 indexed userId, bool inFavor);
    event ProposalApproved(uint256 indexed proposalId, uint256 indexed companyId);

    constructor(address _desciTokenAddress, address _researchCollabAddress) Ownable(msg.sender) {
        desciToken = DeSciToken(_desciTokenAddress);
        researchCollab = ResearchCollab(_researchCollabAddress);
    }

    function createProfile(string memory _profileURI) external {
        require(userAddressToId[msg.sender] == 0, "Profile already exists");
        
        uint256 userId = ++nextUserId;
        profiles[userId] = Profile(_profileURI);
        userAddressToId[msg.sender] = userId;
    }

    function createCompany(string memory _name) external {
        uint256 userId = userAddressToId[msg.sender];
        require(userId != 0, "Create a profile first");
        
        uint256 companyId = ++nextCompanyId;
        
        // Create a new company with empty arrays for proposals and researchList
        uint256[] memory emptyArray = new uint256[](0);
        companies[companyId] = Company(companyId, _name, msg.sender, emptyArray, emptyArray);
        companyMembers[companyId][userId] = true;
        
        emit CompanyCreated(companyId, _name, msg.sender);
    }

    function joinCompany(uint256 _companyId) external {
        require(companies[_companyId].owner != address(0), "Company does not exist");
        
        uint256 userId = userAddressToId[msg.sender];
        require(userId != 0, "Create a profile first");
        require(!companyMembers[_companyId][userId], "Already a member");

        companyMembers[_companyId][userId] = true;

        emit JoinedCompany(userId, _companyId);
    }

    function raiseProposal(uint256 _companyId, string memory _description, string memory _researchURI) external {
        uint256 userId = userAddressToId[msg.sender];
        require(userId != 0, "Create a profile first");
        require(companyMembers[_companyId][userId], "Not a member of this company");

        uint256 proposalId = ++nextProposalId;
        proposals[proposalId] = Proposal(_description, msg.sender, 0, 0, false);

        proposalResearchURI[proposalId] = _researchURI; // Store researchURI separately

        companies[_companyId].proposals.push(proposalId);
        
        desciToken.distributeRewards(msg.sender, proposalCreationReward);

        emit ProposalCreated(proposalId, _companyId, _description, msg.sender);
    }

    function voteOnProposal(uint256 _proposalId, bool _inFavor) external {
        uint256 userId = userAddressToId[msg.sender];
        require(userId != 0, "Create a profile first");

        Proposal storage proposal = proposals[_proposalId];
        require(proposal.proposer != address(0), "Proposal does not exist");
        require(!hasUserVoted[_proposalId][userId], "Already voted");

        hasUserVoted[_proposalId][userId] = true; // Track that the user has voted

        if (_inFavor) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        desciToken.distributeRewards(msg.sender, votingReward);

        if (proposal.votesFor > proposal.votesAgainst && !proposal.approved) {
            proposal.approved = true;
            uint256 companyId = getCompanyOfProposal(_proposalId);
            companies[companyId].researchList.push(_proposalId);
            
            emit ProposalApproved(_proposalId, companyId);
        }

        emit Voted(_proposalId, userId, _inFavor);
    }

    function getCompany(uint256 _companyId) external view returns (uint256, string memory, address, uint256[] memory, uint256[] memory) {
        Company storage company = companies[_companyId];
        return (company.id, company.name, company.owner, company.proposals, company.researchList);
    }

    function getProfile(address _user) external view returns (uint256, string memory) {
        uint256 userId = userAddressToId[_user];
        require(userId != 0, "Profile not found");
        return (userId, profiles[userId].profileURI);
    }

    function getUserId(address _user) external view returns (uint256) {
        return userAddressToId[_user];
    }

    function isMemberOfCompany(uint256 _companyId, uint256 _userId) external view returns (bool) {
        return companyMembers[_companyId][_userId];
    }

    function getProposal(uint256 _proposalId) external view returns (string memory, address, uint256, uint256, bool, string memory) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.description, 
            proposal.proposer, 
            proposal.votesFor, 
            proposal.votesAgainst, 
            proposal.approved,
            proposalResearchURI[_proposalId]
        );
    }

    function getCompanyOfProposal(uint256 _proposalId) public view returns (uint256) {
        for (uint256 i = 1; i <= nextCompanyId; i++) {
            uint256[] memory companyProposals = companies[i].proposals;
            for (uint256 j = 0; j < companyProposals.length; j++) {
                if (companyProposals[j] == _proposalId) {
                    return i;
                }
            }
        }
        revert("Proposal not found in any company");
    }
    
    function setRewardAmounts(uint256 _proposalReward, uint256 _voteReward) external onlyOwner {
        proposalCreationReward = _proposalReward;
        votingReward = _voteReward;
    }
}