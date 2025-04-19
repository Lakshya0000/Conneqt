"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Coins, FileText, Plus, Sparkles } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_600px_at_80%_40%,#4C0B7A,transparent)]" />
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

            <div className="relative z-10 p-6 mt-20 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-12"
                >
                    <h1 className="text-4xl font-bold">
                        <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                            Research Projects
                        </span>
                        <span className="block mt-2 text-base font-normal text-gray-400">
                            Support groundbreaking research initiatives
                        </span>
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                                 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20 
                                 transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Research
                    </motion.button>
                </motion.div>

                {/* Research Cards Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {researchData.map((research, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
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
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {researchData.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32"
                    >
                        <Sparkles className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300">No Research Projects Yet</h3>
                        <p className="text-gray-500 mt-2 mb-8">Create your first research project to get started.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl 
                                     border border-purple-500/20 text-purple-400 hover:bg-gradient-to-r 
                                     hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300"
                        >
                            Create First Project
                        </motion.button>
                    </motion.div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-2xl shadow-2xl 
                                         w-full max-w-md border border-purple-400/20 relative overflow-hidden"
                            >
                                {/* Modal Background Effects */}
                                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                                <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />

                                <div className="relative">
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
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Page;