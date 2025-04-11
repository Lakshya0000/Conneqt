// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

import "./DeSciToken.sol";

contract ResearchEscrow is ReentrancyGuard, Ownable {
    struct ResearchProject {
        uint256 id;
        string title;
        address creator;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool funded;
        bool fundsReleased;
    }

    uint256 private nextProjectId;
    mapping(uint256 => ResearchProject) public projects; // projectId -> ResearchProject
    mapping(uint256 => mapping(address => uint256)) public contributions; // projectId -> (backer -> amount)
    
    // Integration with DeSciToken for rewards
    DeSciToken public desciToken;
    uint256 public fundingReward = 50 * 10**18; // 50 tokens for funding a project
    
    event ProjectCreated(uint256 indexed projectId, string title, address creator, uint256 targetAmount, uint256 deadline);
    event Funded(uint256 indexed projectId, address indexed backer, uint256 amount);
    event FundsReleased(uint256 indexed projectId, uint256 amount);
    event Refunded(uint256 indexed projectId, address indexed backer, uint256 amount);

    constructor(address _desciTokenAddress) Ownable(msg.sender){
        desciToken = DeSciToken(_desciTokenAddress);
    }

    /// @notice Start a crowdfunding campaign for a research project
    function startResearchCrowdfunding(string memory _title, uint256 _targetAmount, uint256 _duration) external {
        require(_targetAmount > 0, "Target amount must be greater than zero");
        require(_duration > 0, "Duration must be greater than zero");

        uint256 projectId = ++nextProjectId;
        projects[projectId] = ResearchProject({
            id: projectId,
            title: _title,
            creator: msg.sender,
            targetAmount: _targetAmount,
            currentAmount: 0,
            deadline: block.timestamp + _duration,
            funded: false,
            fundsReleased: false
        });

        emit ProjectCreated(projectId, _title, msg.sender, _targetAmount, block.timestamp + _duration);
    }

    /// @notice Contribute funds to a research project
    function contributeToResearch(uint256 _projectId) external payable nonReentrant {
        require(projects[_projectId].creator != address(0), "Project does not exist");
        require(block.timestamp < projects[_projectId].deadline, "Crowdfunding has ended");
        require(msg.value > 0, "Contribution must be greater than zero");

        projects[_projectId].currentAmount += msg.value;
        contributions[_projectId][msg.sender] += msg.value;

        // Mark project as funded if goal is met
        if (projects[_projectId].currentAmount >= projects[_projectId].targetAmount) {
            projects[_projectId].funded = true;
        }
        
        // Distribute token rewards for funding
        desciToken.distributeRewards(msg.sender, fundingReward);

        emit Funded(_projectId, msg.sender, msg.value);
    }

    /// @notice Withdraw funds if the target is met and funds have not been released
    function releaseFunds(uint256 _projectId) external nonReentrant {
        ResearchProject storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only creator can withdraw funds");
        require(project.funded, "Funding goal not met");
        require(!project.fundsReleased, "Funds already released");

        project.fundsReleased = true;
        payable(project.creator).transfer(project.currentAmount);

        emit FundsReleased(_projectId, project.currentAmount);
    }

    /// @notice Refund contributors if the funding goal is not met by the deadline
    function claimRefund(uint256 _projectId) external nonReentrant {
        ResearchProject storage project = projects[_projectId];
        require(block.timestamp >= project.deadline, "Crowdfunding is still ongoing");
        require(!project.funded, "Project reached funding goal");
        require(contributions[_projectId][msg.sender] > 0, "No contributions found");

        uint256 refundAmount = contributions[_projectId][msg.sender];
        contributions[_projectId][msg.sender] = 0;
        payable(msg.sender).transfer(refundAmount);

        emit Refunded(_projectId, msg.sender, refundAmount);
    }

    /// @notice Get details of a research project
    function getResearchProject(uint256 _projectId) external view returns (
        string memory, address, uint256, uint256, uint256, bool, bool
    ) {
        ResearchProject storage project = projects[_projectId];
        return (
            project.title,
            project.creator,
            project.targetAmount,
            project.currentAmount,
            project.deadline,
            project.funded,
            project.fundsReleased
        );
    }

    /// @notice Get the amount a user has contributed to a project
    function getUserContribution(uint256 _projectId, address _user) external view returns (uint256) {
        return contributions[_projectId][_user];
    }
    
    /// @notice Set the reward amount for funding projects
    function setFundingReward(uint256 _newReward) external onlyOwner {
        fundingReward = _newReward;
    }
}
