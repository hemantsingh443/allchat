import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { User, Sparkles, Pencil, Check, X, Trash2, Globe, ChevronDown, GitBranch, Brain, Eye, Code, Copy, Maximize2, Edit, FileText, Search, ExternalLink, Link as LinkIcon, Youtube, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import HierarchicalModelSelector from './HierarchicalModelSelector';
import { allModels } from '../data/models';
import 'katex/dist/katex.min.css';
import ActionTooltip from './ActionTooltip';
import { CapabilityIcons } from './CapabilityIcons';

const getFavicon = (url) => {
    try {
        const hostname = new URL(url).hostname;
        if (hostname.includes('youtube.com')) return <Youtube size={14} className="text-red-500 flex-shrink-0" />;
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
            return (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200 flex-shrink-0">
                   <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            );
        }
        return <LinkIcon size={14} className="text-slate-500 dark:text-gray-400 flex-shrink-0" />;
    } catch (e) {
        return <LinkIcon size={14} className="text-slate-500 dark:text-gray-400 flex-shrink-0" />;
    }
};

const CompactResultCard = ({ result, index }) => (
    <motion.a 
        href={result.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative flex-shrink-0 w-52 p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
    >
        <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
            {getFavicon(result.url)}
            <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 truncate">{result.title}</span>
            <ExternalLink size={12} className="text-slate-400 dark:text-gray-500 flex-shrink-0 ml-auto" />
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2">
            {result.content}
        </p>
    </motion.a>
);

const IntegratedSearchResults = ({ results, searchQueries, onSearchSuggestionClick }) => {
    const generateAISuggestions = (results) => {
        if (!results || results.length === 0) return [];
        const topics = new Set();
        results.forEach(result => {
            const titleWords = (result.title || '').toLowerCase().split(/\s+/);
            if (titleWords.length > 2) topics.add(titleWords.slice(0, 3).join(' '));
        });
        const suggestions = Array.from(topics).slice(0, 3);
        if (suggestions.length < 3) suggestions.push("summarize the key findings", "compare these results", "what is the main takeaway?");
        return suggestions.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    };
    const aiSuggestions = generateAISuggestions(results);

    return (
        <div className="my-4">
            {aiSuggestions.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs text-slate-500 dark:text-gray-400 mb-2 px-1">Suggested searches</div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        {aiSuggestions.map((suggestion, index) => (
                            <button key={index} onClick={() => onSearchSuggestionClick && onSearchSuggestionClick(suggestion)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 transition-all duration-200 border border-blue-200/50 dark:border-blue-700/30 shadow-sm cursor-pointer">
                                <Search size={12} className="text-blue-600 dark:text-blue-400" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="text-xs text-slate-500 dark:text-gray-400 mb-2 px-1">Search results</div>
            {searchQueries && searchQueries.length > 0 && (
                <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-2">
                    {searchQueries.map((query, index) => (
                        <button key={index} onClick={() => onSearchSuggestionClick && onSearchSuggestionClick(query)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 transition-colors cursor-pointer">
                            <Search size={12} />
                            {query}
                        </button>
                    ))}
                </div>
            )}
            <div className="relative">
                <div className="flex items-start gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                    {results.map((result, index) => (
                        <CompactResultCard key={result.url || index} result={result} index={index} />
                    ))}
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent dark:from-[#111015] pointer-events-none"></div>
            </div>
        </div>
    );
};

const PlainTextCopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(textToCopy).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); };
    return ( <button onClick={handleCopy} title="Copy message" className="p-1 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors">{isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}</button> );
};

const CodeCopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = (e) => { e.stopPropagation(); navigator.clipboard.writeText(textToCopy).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); };
    return ( <button onClick={handleCopy} className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white transition-all opacity-0 group-hover/code:opacity-100" title="Copy code">{isCopied ? <Check size={16} /> : <Copy size={16} />}</button> );
};

const LanguageLabel = ({ language }) => ( <div className="absolute top-0 left-3 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-0.5 rounded-b-md border border-t-0 border-slate-200 dark:border-slate-700">{language}</div> );

const AiThinkingIndicator = () => {
    const dots = {
        hidden: { opacity: 0 },
        visible: (i) => ({ y: [0, -3, 0], opacity: 1, transition: { delay: i * 0.2, repeat: Infinity, duration: 0.8, ease: "easeInOut" } })
    };
    return (
        <div className="flex items-center gap-2.5 text-slate-500 dark:text-gray-400 text-sm font-medium p-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>Thinking</span>
            <motion.div className="flex gap-1">
                {[0, 1, 2].map(i => <motion.div key={i} custom={i} variants={dots} initial="hidden" animate="visible" className="w-1.5 h-1.5 bg-slate-400 dark:bg-gray-500 rounded-full" />)}
            </motion.div>
        </div>
    );
};

const LiveThoughtsAnimation = ({ streamingThoughts }) => {
    const [thoughtLines, setThoughtLines] = useState([]);
    const bufferRef = useRef('');
    const prevStreamingThoughtsRef = useRef('');

    useEffect(() => {
        if (streamingThoughts === prevStreamingThoughtsRef.current) return;
        
        const newText = streamingThoughts.substring(prevStreamingThoughtsRef.current.length);
        bufferRef.current += newText;
        prevStreamingThoughtsRef.current = streamingThoughts;

        const lines = bufferRef.current.split(/(\*\*.*?\*\*.*?(?:\.\.\.|\n))/g).filter(Boolean);
        
        const newThoughtLines = [];
        let unprocessed = '';

        lines.forEach(line => {
            if (line.endsWith('...') || line.endsWith('\n')) {
                newThoughtLines.push({ id: Date.now() + Math.random(), text: line.trim() });
            } else {
                unprocessed += line;
            }
        });
        
        bufferRef.current = unprocessed;

        if (newThoughtLines.length > 0) {
            setThoughtLines(prev => [...prev, ...newThoughtLines].slice(-4));
        }
    }, [streamingThoughts]);
    
    return (
        <div className="mb-4 w-full h-24 relative overflow-hidden flex items-start border-l-2 border-indigo-400/50 pl-3">
            <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0 pt-1">
                <Wand2 size={14} />
                <span className="font-medium text-xs uppercase tracking-wider">Thinking</span>
            </div>
            <div className="relative h-full flex-1 flex flex-col justify-end items-start text-sm text-slate-500 dark:text-gray-400 space-y-2 pl-3">
                <AnimatePresence initial={false}>
                    {thoughtLines.map((line) => (
                        <motion.div
                            key={line.id}
                            layout
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 30 } }}
                            exit={{ opacity: 0, y: -25, transition: { duration: 0.3 } }}
                            className="w-full"
                        >
                           <ReactMarkdown
                                components={{ p: ({children}) => <p className="m-0 truncate">{children}</p> }}
                           >
                               {line.text}
                           </ReactMarkdown>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ToggledThoughtsDisplay = ({ thoughts }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!thoughts) return null;
    const formattedThoughts = thoughts.replace(/\*\*(.*?)\*\*/g, '\n**$1**');
    return (
        <div className="mb-3 w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-2.5 py-1.5 border border-indigo-200 dark:border-indigo-700/80 rounded-lg text-xs text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                <Wand2 size={14} />
                <span>View thought process</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                        <div className="mt-2 prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50">
                            <ReactMarkdown>{formattedThoughts}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const GoogleThinkingUI = ({ isStreaming, thoughts }) => {
    if (!thoughts && !isStreaming) return null;
    if (isStreaming && thoughts) return <LiveThoughtsAnimation streamingThoughts={thoughts} />;
    if (!isStreaming && thoughts) return <ToggledThoughtsDisplay thoughts={thoughts} />;
    return null;
};

const DeepSeekReasoningDisplay = ({ reasoning }) => {
    const [isOpen, setIsOpen] = useState(true);
    if (!reasoning) return null;
    return (
        <div className="mb-3 w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-2 py-0.5 border border-slate-300 dark:border-slate-600 rounded-md text-xs text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span>Reasoning</span>
                <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}><ChevronDown size={14} /></motion.div>
            </button>
            <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? '0.5rem' : '0rem' }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                 <div className="prose prose-xs prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800/30 rounded-md border border-slate-200 dark:border-slate-700/50">
                    <ReactMarkdown>{reasoning}</ReactMarkdown>
                </div>
            </motion.div>
        </div>
    );
};

// ** UPDATED AND MORE ROBUST PRE-PROCESSOR **
const preprocessMarkdown = (markdown) => {
    if (!markdown) return '';

    let processedText = markdown;
    
    // 1. Sanitize smart punctuation for better LaTeX compatibility.
    processedText = processedText
        .replace(/’/g, "'")
        .replace(/“/g, '"')
        .replace(/”/g, '"')
        .replace(/‘/g, "'")
        .replace(/—/g, '---')
        .replace(/–/g, '--');

    // 2. Normalize block-level LaTeX.
    // Converts [ ... ] (when on its own line, with optional space) to $$ ... $$
    // This is safer than a global replacement to avoid capturing things like [a link].
    processedText = processedText.replace(
        /^\[\s*([\s\S]+?)\s*\]$/gm,
        (match, content) => `$$${content.trim()}$$`
    );

    // 3. Handle the malformed, multi-line parenthesized block.
    // This is a targeted fix for the specific broken example. It finds the block,
    // cleans up internal newlines/spacing, and wraps it correctly.
    processedText = processedText.replace(
        /\(\s*ζ\s*\(\s*2\s*\)[\s\S]+?\)/g,
        (match) => {
            // Clean the content by removing the outer parens and collapsing newlines/excess space
            let cleanedContent = match.slice(1, -1).replace(/\s*\n\s*/g, ' ').trim();
            // In the specific example, there's a weird "ζ(2" pattern. Let's fix it.
            cleanedContent = cleanedContent.replace(/ζ\s*\(\s*2\s*\)/, 'ζ(2)');
            return `$$${cleanedContent}$$`;
        }
    );

    // After other processing, ensure standard delimiters are also handled,
    // though remark-math should do this. This is for consistency.
    processedText = processedText.replace(/\\\[([\s\S]+?)\\\]/g, (match, content) => `$$${content}$$`);
    processedText = processedText.replace(/\\\(([\s\S]+?)\\\)/g, (match, content) => `$${content}$`);

    return processedText;
};


const ChatMessage = React.memo(({ id, text, sender, editCount, imageUrl, usedWebSearch, modelId, handleUpdateMessage, handleDeleteMessage, onImageClick, handleRegenerate, handleBranch, searchResults, fileName, fileType, reasoning, isStreaming, handleSearchSuggestionClick, isGuest = false }) => {
    const isUser = sender === 'user';
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [showRegenModelSelector, setShowRegenModelSelector] = useState(false);
    const [showBranchModelSelector, setShowBranchModelSelector] = useState(false);
    const [isHoveringImage, setIsHoveringImage] = useState(false);

    const modelDetails = allModels.find(m => m.id === modelId);
    const isAI = sender === 'ai';
    const finalReasoning = reasoning?.trim() || null;
    const googleThoughts = isAI && modelId?.startsWith('google/') ? finalReasoning : null;
    const deepSeekReasoning = isAI && !modelId?.startsWith('google/') ? finalReasoning : null;
    const hasSearchResults = isAI && searchResults && ((searchResults.results && searchResults.results.length > 0) || (Array.isArray(searchResults) && searchResults.length > 0));

    const isDarkMode = () => typeof window !== 'undefined' && (document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches);
    const lightModeCodeColors = { backgroundColor: '#fdf2f8', color: '#374151', borderColor: '#f472b6' };
    const darkModeCodeColors = { backgroundColor: '#1a1625', color: '#e5e7eb', borderColor: '#7c3aed' };
    const currentCodeColors = isDarkMode() ? darkModeCodeColors : lightModeCodeColors;
    const customLightStyle = { ...prism, 'pre[class*="language-"]': { ...prism['pre[class*="language-"]'], background: lightModeCodeColors.backgroundColor, color: lightModeCodeColors.color, border: `1px solid ${lightModeCodeColors.borderColor}` }, 'code[class*="language-"]': { ...prism['code[class*="language-"]'], background: 'transparent', color: lightModeCodeColors.color }, '.token.comment': { color: '#6b7280' }, '.token.prolog': { color: '#6b7280' }, '.token.doctype': { color: '#6b7280' }, '.token.cdata': { color: '#6b7280' }, '.token.punctuation': { color: '#374151' }, '.token.property': { color: '#dc2626' }, '.token.tag': { color: '#dc2626' }, '.token.constant': { color: '#dc2626' }, '.token.symbol': { color: '#dc2626' }, '.token.deleted': { color: '#dc2626' }, '.token.boolean': { color: '#059669' }, '.token.number': { color: '#059669' }, '.token.selector': { color: '#7c3aed' }, '.token.attr-name': { color: '#7c3aed' }, '.token.string': { color: '#0891b2' }, '.token.char': { color: '#0891b2' }, '.token.builtin': { color: '#0891b2' }, '.token.inserted': { color: '#0891b2' }, '.token.operator': { color: '#374151' }, '.token.entity': { color: '#374151' }, '.token.url': { color: '#374151' }, '.token.atrule': { color: '#7c3aed' }, '.token.attr-value': { color: '#0891b2' }, '.token.keyword': { color: '#dc2626' }, '.token.function': { color: '#7c3aed' }, '.token.class-name': { color: '#dc2626' }, '.token.regex': { color: '#059669' }, '.token.important': { color: '#dc2626', fontWeight: 'bold' }, '.token.variable': { color: '#374151' } };
    const syntaxStyle = isDarkMode() ? vscDarkPlus : customLightStyle;

    const handleSave = async () => { if (editText.trim() === text.trim() || editText.trim() === '') { setIsEditing(false); return; } await handleUpdateMessage(id, editText); setIsEditing(false); };
    const handleCancel = () => { setEditText(text); setIsEditing(false); };
    const handleKeyDown = (e) => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSave(); } if (e.key === 'Escape') { e.preventDefault(); handleCancel(); } };

    const processedText = useMemo(() => preprocessMarkdown(text), [text]);

    return (
        <motion.div className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : ''}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            {!isUser && <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-purple-200 dark:bg-purple-900/50"><Sparkles size={18} className="text-purple-600 dark:text-purple-400" /></div>}
            <div className={`group relative max-w-2xl ${isUser ? 'flex flex-col items-end' : 'w-full flex flex-col items-start'}`}>
                {isAI && isStreaming && !text && !googleThoughts && !deepSeekReasoning && <AiThinkingIndicator />}
                <GoogleThinkingUI isStreaming={isStreaming} thoughts={googleThoughts} />
                {deepSeekReasoning && <DeepSeekReasoningDisplay reasoning={deepSeekReasoning} />}
                
                {(imageUrl || (fileName && fileType === 'application/pdf')) && !isEditing && ( <div className="mb-2">{imageUrl ? (<div className="relative group/image" onMouseEnter={() => setIsHoveringImage(true)} onMouseLeave={() => setIsHoveringImage(false)}><GlassPanel className="p-1 rounded-lg overflow-hidden"><div className="relative"><img src={imageUrl} alt="User upload" className="rounded-md w-48 h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onImageClick(imageUrl)} /><motion.div initial={{ opacity: 0 }} animate={{ opacity: isHoveringImage ? 1 : 0 }} className="absolute inset-0 bg-black/40 flex items-center justify-center"><button onClick={() => onImageClick(imageUrl)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors" title="View full size"><Maximize2 size={20} /></button></motion.div></div></GlassPanel></div>) : (<GlassPanel className="p-2 inline-flex items-center gap-3 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700"><FileText size={20} className="text-slate-600 dark:text-slate-400 flex-shrink-0" /><span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{fileName}</span></GlassPanel>)}</div> )}
                {isEditing ? (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mb-3 w-full">
                        <GlassPanel className="p-1 w-full" style={{ borderRadius: '1rem 1rem 0 1rem' }}>
                            <div className="px-3 py-1">
                                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-gray-200"><div className="p-1.5 rounded-lg bg-white/20 dark:bg-gray-700/40"><Edit size={14} /></div><span className="font-medium text-sm">Edit Message</span></div>
                                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-transparent text-slate-800 dark:text-gray-100 focus:outline-none resize-none border-none placeholder-slate-500 dark:placeholder-gray-400" rows={Math.max(3, editText.split('\n').length)} autoFocus placeholder="Type your message..." />
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10 dark:border-gray-700/30">
                                    <span className="text-xs text-slate-600 dark:text-gray-400">Ctrl+Enter to save • Esc to cancel</span>
                                    <div className="flex gap-2"><button onClick={handleCancel} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 transition-colors" title="Cancel"><X size={18} /></button><button onClick={handleSave} className="p-2 rounded-full bg-gradient-to-r from-blue-500/80 to-sky-500/80 hover:from-blue-600/80 hover:to-sky-600/80 text-white shadow-lg backdrop-blur-sm border border-blue-400/30" title="Save"><Check size={18} /></button></div>
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.div>
                ) : (
                    <>
                        {isUser && text && ( <GlassPanel className="p-1" style={{ borderRadius: '1rem 1rem 0 1rem' }}><div className="prose prose-sm prose-slate dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none px-3 py-1 text-slate-800 dark:text-white">{text}</div></GlassPanel> )}
                        {!isUser && text && (
                            <div className="w-full">
                                <div className="prose prose-sm prose-slate dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none text-slate-800 dark:text-white">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const codeString = String(children).replace(/\n$/, '');
                                                if (!inline && match) {
                                                    return (
                                                        <div className="relative group/code my-4 rounded-xl overflow-hidden">
                                                            <CodeCopyButton textToCopy={codeString} />
                                                            <LanguageLabel language={match[1]} />
                                                            <SyntaxHighlighter children={codeString} style={syntaxStyle} language={match[1]} PreTag="div" className="custom-code-scrollbar !pt-8" customStyle={{ margin: 0, padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: currentCodeColors.backgroundColor }} {...props} />
                                                        </div>
                                                    );
                                                }
                                                return <code className="bg-slate-200 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-red-300 px-1.5 py-1 rounded-md" {...props}>{children}</code>;
                                            }
                                        }}
                                    >{processedText}</ReactMarkdown>
                                    {isStreaming && text.length > 0 && <span className="inline-block w-2 h-4 bg-slate-800 dark:bg-white ml-1 animate-pulse"></span>}
                                </div>
                                {hasSearchResults && <IntegratedSearchResults results={searchResults.results || searchResults} searchQueries={searchResults.queries} onSearchSuggestionClick={handleSearchSuggestionClick} />}
                                {!isUser && !isStreaming && (
                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="pb-2 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/50 w-full">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                                                <button onClick={() => setShowRegenModelSelector(true)} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-gray-200 transition-colors" title="Regenerate with another model"><span>via {modelDetails?.name || 'an AI model'}</span><ChevronDown size={14} /></button>
                                                {modelDetails?.capabilities && <div className="hidden sm:flex"><CapabilityIcons capabilities={modelDetails.capabilities} /></div>}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                {text && <PlainTextCopyButton textToCopy={text} />}
                                                <ActionTooltip text="Regenerate"><button onClick={() => handleRegenerate(id, modelId)} className="p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10" title="Regenerate with same model"><Sparkles size={14} /></button></ActionTooltip>
                                                <ActionTooltip text="Branch Chat"><button onClick={() => setShowBranchModelSelector(true)} className="p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10" title="Branch into new chat"><GitBranch size={14} /></button></ActionTooltip>
                                                <HierarchicalModelSelector isOpen={showRegenModelSelector || showBranchModelSelector} title={showRegenModelSelector ? 'Regenerate with' : 'Branch with'} onClose={() => {setShowRegenModelSelector(false); setShowBranchModelSelector(false);}} onSelectModel={(newModelId) => { if (showRegenModelSelector) handleRegenerate(id, newModelId); if (showBranchModelSelector) handleBranch(id, newModelId); }} currentModelId={modelId} isGuest={isGuest} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                        {isUser && (
                            <div className="flex items-center justify-end gap-3 h-8 pr-1 pt-1.5 -mr-1">
                                {usedWebSearch && <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 opacity-80"><Globe size={13} /><span>Web</span></div>}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    {editCount > 0 && <span className="text-xs text-slate-500 dark:text-gray-500 italic">(edited)</span>}
                                    <button onClick={() => { setEditText(text); setIsEditing(true); }} className="p-1 rounded-full text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Edit message"><Pencil size={14} /></button>
                                    <button onClick={() => handleDeleteMessage(id)} className="p-1 rounded-full text-slate-500 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete message"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {isUser && <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-200 dark:bg-blue-900/50"><User size={18} className="text-blue-600 dark:text-blue-400" /></div>}
        </motion.div>
    );
});

export default ChatMessage;