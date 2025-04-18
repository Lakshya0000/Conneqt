"use client";
import { useEffect, useState } from "react";
import { Calendar, Coins, FileText } from 'lucide-react';
import Navbar from "../components/Navbar";
import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { startResearchCrowdfundingConfig, contributeToResearchConfig } from "@/contract/function";
import { formatEther, parseEther } from "viem";
import { toast } from "sonner";
import { escrowABI, escrowAddress } from "@/contract/contract";

import ResearchCard from "../components/ResearchCard";
// Add this helper function at the top of your Page component
const useCountdown = (deadline) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = deadline - now;

            if (remaining <= 0) {
                setTimeLeft("Expired");
                clearInterval(timer);
            } else {
                const days = Math.floor(remaining / (24 * 60 * 60));
                const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
                const minutes = Math.floor((remaining % (60 * 60)) / 60);
                const seconds = remaining % 60;
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    return timeLeft;
};

const Page = () => {
    const [showModal, setShowModal] = useState(false);
    const { writeContractAsync } = useWriteContract();
    const { writeContractAsync: contributeAsync } = useWriteContract(contributeToResearchConfig);
    const [researchData, setResearchData] = useState([]);
    const [contributionAmounts, setContributionAmounts] = useState({});

    const [newResearch, setNewResearch] = useState({
        title: '',
        description: '',
        amount: '',
        deadline: ''
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewResearch({ ...newResearch, [name]: value });
    };
    // Fetch total number of research projects
    const { data: totalProjects } = useReadContract({
        abi: escrowABI,
        address: escrowAddress,
        functionName: "nextProjectId",
    });

    // Create an array of contract reading configurations
    const getContractConfigs = () => {
        if (!totalProjects) return [];

        const configs = [];
        for (let i = 1; i <= Number(totalProjects); i++) {
            configs.push({
                abi: escrowABI,
                address: escrowAddress,
                functionName: "getResearchProject",
                args: [i],
            });
        }
        return configs;
    };

    // Use `useReadContracts` to batch fetch all research projects
    const { data: projectsData } = useReadContracts({
        contracts: getContractConfigs(),
    });

    // Process fetched data and update state
    useEffect(() => {
        if (!projectsData) return;
        console.log("Fetched Projects Data:", projectsData);
        const processedProjects = projectsData.map((project, index) => {
            if (!project?.result) return null;

            const title = project.result[0];
            const description = "This is Description";
            const amount = formatEther(project.result[2]);
            const currentFunding = formatEther(project.result[3]);
            const deadlineInSeconds = Number(project.result[4]);

            return {
                id: index + 1,
                title,
                amount,
                currentFunding,
                deadlineInSeconds,
                description,
            };
        });

        setResearchData(processedProjects.filter((project) => project !== null));
    }, [projectsData]);
    const handleCreateResearch = async () => {
        try {
            const amountInWei = parseEther(newResearch.amount.replace(' ETH', ''));
            const deadlineDate = new Date(newResearch.deadline);
            const currentDate = new Date();
            const durationInSeconds = Math.floor((deadlineDate - currentDate) / 1000);

            if (durationInSeconds <= 0) {
                alert('Deadline must be in the future');
                return;
            }

            await writeContractAsync({
                ...startResearchCrowdfundingConfig,
                args: [
                    newResearch.title,
                    amountInWei,
                    durationInSeconds
                ]
            });

            toast.success('Research created successfully!');
            setNewResearch({
                title: '',
                description: '',
                amount: '',
                deadline: ''
            });
            setShowModal(false);
        } catch (error) {
            console.error('Error creating research:', error);
            alert('Error creating research. Please try again.');
        }
    };
    const handleContribute = async (projectId) => {
        try {
            const amount = contributionAmounts[projectId];
            if (!amount) {
                alert("Please enter a contribution amount");
                return;
            }
            const amountInWei = parseEther(amount);

            await contributeAsync({
                ...contributeToResearchConfig,
                args: [projectId], value: amountInWei
            });

            alert("Contribution successful!");
            // Clear the specific input field
            setContributionAmounts((prev) => ({
                ...prev,
                [projectId]: "",
            }));

            // Optionally, refetch data or update the UI dynamically
            // const { data } = await useReadContracts({
            //     contracts: getContractConfigs(),
            // });
            // if (data) {
            //     const processed = data.map((project, index) => {
            //         // ... your existing processing logic
            //     });
            //     setResearchData(processed.filter((project) => project !== null));
            // }
        } catch (error) {
            console.error("Error contributing:", error);
            alert("Failed to contribute. Please try again.");
        }
    };

    return (
        <div className="p-6 mt-20 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Research Projects
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                >
                    <FileText className="w-5 h-5" />
                    Create Research
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {researchData.map((research, index) => (
                    <ResearchCard
                        key={index}
                        research={research}
                        contributionAmount={contributionAmounts[research.id]}
                        onContributionChange={(value) =>
                            setContributionAmounts((prev) => ({
                                ...prev,
                                [research.id]: value,
                            }))
                        }
                        onContribute={() => handleContribute(research.id)}
                    />
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-purple-400/30">
                        <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                            <FileText className="w-6 h-6" />
                            Create Research
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newResearch.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter research title"
                                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    name="description"
                                    value={newResearch.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter research description"
                                    rows="4"
                                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Funding Amount</label>
                                <div className="relative">
                                    <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="amount"
                                        value={newResearch.amount}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 10 ETH"
                                        className="w-full p-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Deadline</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={newResearch.deadline}
                                        onChange={handleInputChange}
                                        className="w-full p-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8 gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateResearch}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;