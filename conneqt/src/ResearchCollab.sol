// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./DeSciToken.sol"; // Assuming DeSciToken is in the same directory

contract ResearchCollab is ERC721URIStorage, Ownable {
    struct Research {
        string title;
        uint256 currentVersion;
        mapping(uint256 => string) versionHistory;
    }
    
    struct Collaborator {
        address collaborator;
        uint64 expires;
    }
    
    uint256 private _nextTokenId;
    mapping(uint256 => Research) public researchData;
    mapping(uint256 => Collaborator) public collaborators;
    mapping(address => uint256[]) public userCollaborations;
    
    DeSciToken public desciToken;
    uint256 public updateReward = 100 * 10**18;
    
    event ResearchCreated(uint256 indexed tokenId, string title, string metadataURI);
    event ResearchUpdated(uint256 indexed tokenId, uint256 newVersion, string newMetadataURI);
    event CollaboratorAssigned(uint256 indexed tokenId, address indexed collaborator, uint64 expires);
    
    constructor(address _desciTokenAddress) ERC721("ResearchNFT", "RSCNFT") Ownable(msg.sender) {
        desciToken = DeSciToken(_desciTokenAddress);
    }
    
    function createResearch(string memory _title, string memory _metadataURI) external {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _metadataURI);
        
        Research storage research = researchData[tokenId];
        research.title = _title;
        research.currentVersion = 1;
        research.versionHistory[1] = _metadataURI;
        
        emit ResearchCreated(tokenId, _title, _metadataURI);
    }
    
    function updateResearch(uint256 _tokenId, string memory _newMetadataURI) external {
        require(_isOwnerOrCollaborator(_tokenId, msg.sender), "Not authorized");
        
        Research storage research = researchData[_tokenId];
        research.currentVersion++;
        research.versionHistory[research.currentVersion] = _newMetadataURI;
        _setTokenURI(_tokenId, _newMetadataURI);
        
        desciToken.distributeRewards(msg.sender, updateReward);
        emit ResearchUpdated(_tokenId, research.currentVersion, _newMetadataURI);
    }
    
    function getLatestResearch(uint256 _tokenId) external view returns (string memory, string memory, uint256) {
        Research storage research = researchData[_tokenId];
        return (research.title, research.versionHistory[research.currentVersion], research.currentVersion);
    }
    
    function getResearchVersion(uint256 _tokenId, uint256 _version) external view returns (string memory) {
        require(_version > 0 && _version <= researchData[_tokenId].currentVersion, "Invalid version");
        return researchData[_tokenId].versionHistory[_version];
    }
    
    function assignCollaborator(uint256 _tokenId, address _collaborator, uint64 _expires) external {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        collaborators[_tokenId] = Collaborator(_collaborator, _expires);
        userCollaborations[_collaborator].push(_tokenId);
        emit CollaboratorAssigned(_tokenId, _collaborator, _expires);
    }
    
    function getCollaborations(address _user) external view returns (uint256[] memory) {
        return userCollaborations[_user];
    }
    
    function _isOwnerOrCollaborator(uint256 _tokenId, address _account) public view returns (bool) {
        if (ownerOf(_tokenId) == _account) {
            return true;
        }
        Collaborator storage collaborator = collaborators[_tokenId];
        return (collaborator.collaborator == _account && block.timestamp <= collaborator.expires);
    }
    
    function setUpdateReward(uint256 _newReward) external onlyOwner {
        updateReward = _newReward;
    }
}