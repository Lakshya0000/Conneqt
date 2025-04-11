// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DeSciToken.sol";
import "../src/ResearchCollab.sol";
import "../src/ResearchCompany.sol";
import "../src/ResearchEscrow.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy DeSciToken
        DeSciToken token = new DeSciToken();
        console.log("DeSciToken deployed at:", address(token));

        // Deploy ResearchCollab with the DeSciToken address
        ResearchCollab collab = new ResearchCollab(address(token));
        console.log("ResearchCollab deployed at:", address(collab));

        // Deploy ResearchCompany
        ResearchCompany company = new ResearchCompany(address(token),address(collab));
        console.log("ResearchCompany deployed at:", address(company));

        // Deploy ResearchEscrow
        ResearchEscrow escrow = new ResearchEscrow(address(token));
        console.log("ResearchEscrow deployed at:", address(escrow));

        vm.stopBroadcast();
    }
}
