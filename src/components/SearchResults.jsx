import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronUp, ExternalLink, Youtube, Link as LinkIcon } from 'lucide-react';

const ResultCard = ({ result, index }) => {
    const isYoutube = result.url.includes("youtube.com/watch");
    const videoId = isYoutube ? new URL(result.url).searchParams.get('v') : null;

    const SourceButton = () => (
        <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            title="Open original source"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-all backdrop-blur-sm z-10"
            onClick={(e) => e.stopPropagation()} 
        >
            <ExternalLink size={14} />
        </a>
    );

    if (isYoutube && videoId) {
        return (
            <motion.div 
                className="group relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800/70 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
            >
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={result.title}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                <div className="p-3">
                    <h3 className="text-sm font-medium text-slate-800 dark:text-gray-200 mb-1">{result.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2">{result.content}</p>
                </div>
                <SourceButton />
            </motion.div>
        );
    }
    
    return (
        <motion.div
            className="group relative block p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
        >
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0" aria-label={result.title}></a>

            <div className="flex items-center gap-3 mb-1 relative z-10">
                {result.url.includes('twitter.com') || result.url.includes('x.com') ? 
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1DA1F2] flex-shrink-0">
                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg> :
                    <LinkIcon className="w-5 h-5 text-slate-500 dark:text-gray-400 flex-shrink-0" />
                }
                <span className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate">{result.title}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 relative z-10">
                {result.content}
            </p>
            <SourceButton />
        </motion.div>
    );
};

const SearchResults = ({ results }) => {
    const [isOpen, setIsOpen] = useState(true);
    if (!results || results.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div 
            className="my-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-t-lg bg-slate-200/70 dark:bg-slate-800/70"
            >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
                    <Globe size={16} />
                    <span>Search Results</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                    <span>{results.length} Results</span>
                    <ChevronUp size={18} className={`transition-transform ${isOpen ? '' : 'rotate-180'}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                        className="overflow-hidden"
                    >
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 rounded-b-lg bg-slate-100/30 dark:bg-slate-900/30"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {results.map((result, index) => (
                                <ResultCard key={index} result={result} index={index} />
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SearchResults; 