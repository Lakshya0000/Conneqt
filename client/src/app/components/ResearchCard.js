"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Clock, Target, TrendingUp, Sparkles } from "lucide-react";

// Custom loading indicator
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
        <motion.div
            className="relative w-12 h-12"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute inset-0 border-t-2 border-r-2 border-purple-500 rounded-full" />
            <div className="absolute inset-0 border-b-2 border-l-2 border-pink-500 rounded-full opacity-70" />
        </motion.div>
    </div>
);

const useCountdown = (deadline) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!deadline) return;

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

const ResearchCard = ({
    research,
    onContribute,
    contributionAmount,
    onContributionChange,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const requiredAmount = parseFloat(research.amount);
    const currentAmount = parseFloat(research.currentFunding || 0);
    const progress = (currentAmount / requiredAmount) * 100;
    const timeLeft = useCountdown(research.deadlineInSeconds);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-gray-800/50 to-gray-900/30 rounded-xl backdrop-blur-sm" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] rounded-xl" />

            {/* Glow Effects */}
            <div className="absolute -inset-px bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Main Content */}
            <div className="relative p-6 rounded-xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Title with Gradient */}
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                            {research.title}
                        </h2>

                        {/* Description with Better Typography */}
                        <p className="text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">
                            {research.description}
                        </p>

                        {/* Enhanced Timer Badge */}
                        <div className="mb-6">
                            <div className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-full 
                                ${timeLeft === "Expired"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}
                            `}>
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-purple-400">Progress</span>
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {progress.toFixed(1)}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Funding Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-700/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-400">Target</span>
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {research.amount} ETH
                                </span>
                            </div>
                            <div className="bg-gray-700/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-400">Raised</span>
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {research.currentFunding || "0"} ETH
                                </span>
                            </div>
                        </div>

                        {/* Contribution Section */}
                        {timeLeft !== "Expired" && progress < 100 && (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter amount in ETH"
                                        value={contributionAmount || ""}
                                        onChange={(e) => onContributionChange(e.target.value)}
                                        className="w-full pl-10 p-3 bg-gray-700/30 border border-purple-500/20 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20"
                                    />
                                </div>
                                <button
                                    onClick={onContribute}
                                    disabled={progress >= 100}
                                    className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Coins className="w-4 h-4" />
                                    Fund Research
                                </button>
                            </div>
                        )}

                        {/* Status Message */}
                        {(timeLeft === "Expired" || progress >= 100) && (
                            <div className="bg-gray-700/30 p-3 rounded-lg text-center">
                                <span className="text-sm text-gray-400">
                                    {progress >= 100 ? "Funding goal achieved!" : "Funding period has ended"}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default ResearchCard;