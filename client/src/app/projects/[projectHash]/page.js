"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, ArrowLeft, Edit2, History, X, Split, Eye, GitCompare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as Diff from 'diff';

const getDiff = (oldText, newText) => {
    return Diff.diffLines(oldText || '', newText || '');
};

const Page = ({ params }) => {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [version, setVersion] = useState("");
    const [versions, setVersions] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [compareMode, setCompareMode] = useState('view'); // 'view', 'diff', 'edit'

    useEffect(() => {
        // Mock data fetch
        const initialContent = "# Research Paper\n\nThis is your research paper content. You can edit it here.";
        setContent(initialContent);
        setOriginalContent(initialContent);
    }, [params.projectHash]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (content === originalContent) {
            setIsEditing(false);
            return;
        }
        setShowVersionModal(true);
    };

    const handleVersionSave = async () => {
        setIsSaving(true);
        try {
            // Here you would typically save to your backend
            const newVersion = {
                id: versions.length + 1,
                content: content,
                version: version,
                timestamp: new Date().toISOString(),
            };
            setVersions([...versions, newVersion]);
            setOriginalContent(content);
            setShowVersionModal(false);
            setIsEditing(false);
            setVersion("");
        } catch (error) {
            console.error("Error saving:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setContent(originalContent);
        setIsEditing(false);
    };

    const handleCompare = () => {
        setShowComparison(true);
    };

    return (
        <div className="mt-20 min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3B0764,transparent)]" />
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

            <div className="relative z-10 p-6 max-w-7xl mx-auto pt-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Projects
                    </button>
                    <div className="flex gap-3">
                        {versions.length > 0 && !isEditing && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCompare}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl
                                         flex items-center gap-2"
                            >
                                <Split className="w-5 h-5" />
                                Compare Versions
                            </motion.button>
                        )}
                        {!showComparison && (
                            !isEditing ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEdit}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl
                                             flex items-center gap-2"
                                >
                                    <Edit2 className="w-5 h-5" />
                                    Edit
                                </motion.button>
                            ) : (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl
                                                 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </motion.button>
                                </>
                            )
                        )}
                    </div>
                </div>

                {/* Comparison Mode Controls */}
                {showComparison && (
                    <div className="mb-6 bg-gray-900/30 p-4 rounded-xl backdrop-blur-sm border border-purple-500/10">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setCompareMode('view');
                                        setShowComparison(false);
                                    }}
                                    className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                                            ${compareMode === 'view'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Latest
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCompareMode('diff')}
                                    className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                                            ${compareMode === 'diff'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                >
                                    <GitCompare className="w-4 h-4" />
                                    Compare
                                </motion.button>
                            </div>
                            {compareMode === 'diff' && (
                                <select
                                    value={selectedVersion?.id || ''}
                                    onChange={(e) => {
                                        const version = versions.find(v => v.id === Number(e.target.value));
                                        setSelectedVersion(version);
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white rounded-xl
                                            border border-purple-500/20 focus:border-purple-500/50 transition-all
                                            outline-none cursor-pointer"
                                >
                                    <option value="">Select version to compare</option>
                                    {versions.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.version} - {new Date(v.timestamp).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                )}

                {/* Editor Section */}
                <div className={`grid ${compareMode === 'diff' && showComparison ? 'grid-cols-2 gap-6' : 'grid-cols-1'}`}>
                    {/* Current Version */}
                    <motion.div
                        layout
                        className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/10 p-6
                                 shadow-lg shadow-purple-500/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-400">Current Version</div>
                            {!showComparison && (
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                                    Latest
                                </span>
                            )}
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => isEditing && setContent(e.target.value)}
                            readOnly={!isEditing || showComparison}
                            className={`w-full h-[70vh] bg-transparent text-white resize-none focus:outline-none
                                     text-lg leading-relaxed ${(!isEditing || showComparison) && 'cursor-default'}
                                     scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent
                                     hover:scrollbar-thumb-purple-500/30`}
                            placeholder="Start writing your research paper..."
                        />
                    </motion.div>

                    {/* Comparison Version */}
                    {compareMode === 'diff' && showComparison && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/10 p-6
                                     shadow-lg shadow-purple-500/5"
                        >
                            <div className="text-sm text-gray-400 mb-4">
                                {selectedVersion ? (
                                    <div className="flex items-center justify-between">
                                        <span>{selectedVersion.version}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(selectedVersion.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    'Select a version to compare'
                                )}
                            </div>
                            {selectedVersion ? (
                                compareMode === 'diff' ? (
                                    <div className="h-[70vh] overflow-auto">
                                        {getDiff(selectedVersion.content, content).map((part, i) => (
                                            <div
                                                key={i}
                                                className={`p-2 ${part.added ? 'bg-green-500/10 text-green-400' :
                                                    part.removed ? 'bg-red-500/10 text-red-400' :
                                                        'text-white'
                                                    }`}
                                            >
                                                <pre className="whitespace-pre-wrap font-sans text-lg">
                                                    {part.value}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        value={selectedVersion.content}
                                        readOnly
                                        className="w-full h-[70vh] bg-transparent text-white resize-none focus:outline-none
                                                 text-lg leading-relaxed cursor-default scrollbar-thin 
                                                 scrollbar-thumb-purple-500/20 scrollbar-track-transparent
                                                 hover:scrollbar-thumb-purple-500/30"
                                    />
                                )
                            ) : (
                                <div className="h-[70vh] flex items-center justify-center text-gray-500">
                                    Select a version from the dropdown above to compare
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Version History */}
                {!showComparison && versions.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Version History
                        </h3>
                        <div className="space-y-2">
                            {versions.map((v) => (
                                <div
                                    key={v.id}
                                    className="p-4 bg-gray-800/50 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="font-medium">{v.version}</h4>
                                        <p className="text-sm text-gray-400">
                                            {new Date(v.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Version Modal */}
                <AnimatePresence>
                    {showVersionModal && (
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
                                className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold">Save Version</h3>
                                    <button
                                        onClick={() => setShowVersionModal(false)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    placeholder="Enter version name (e.g., v1.0)"
                                    className="w-full p-3 bg-gray-800 rounded-lg mb-4"
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowVersionModal(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVersionSave}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                                    >
                                        Save Version
                                    </button>
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