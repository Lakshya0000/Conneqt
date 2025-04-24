"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Book, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const [projects, setProjects] = useState([
        { id: 1, title: "Research Paper 1", preview: "This is a preview of research paper 1..." },
        { id: 2, title: "Research Paper 2", preview: "This is a preview of research paper 2..." },
        // Add more sample projects as needed
    ]);

    const ProjectCard = ({ project }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 rounded-xl 
                     border border-purple-500/10 hover:border-purple-500/30 cursor-pointer
                     backdrop-blur-sm transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Book className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                </div>
                <button className="text-purple-400 hover:text-purple-300">
                    <FileText className="w-5 h-5" />
                </button>
            </div>
            <p className="text-gray-400 text-sm line-clamp-3">{project.preview}</p>
            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">Last edited: 2 days ago</span>
                <span className="text-xs text-purple-400">Click to edit</span>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white mt-20">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]" />
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

            <div className="relative z-10 p-6 max-w-7xl mx-auto pt-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Research Papers
                        </h1>
                        <p className="text-gray-400 mt-2">Your research documents and drafts</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                                 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Paper
                    </motion.button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;