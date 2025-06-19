import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { User, Sparkles, Pencil, Check, X, Trash2, Globe, ChevronDown, GitBranch, Brain, Eye, Code, Copy, Maximize2, Edit, FileText, Search, ExternalLink, Link as LinkIcon, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import HierarchicalModelSelector from './HierarchicalModelSelector';
import { allModels } from '../data/models';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ActionTooltip from './ActionTooltip';

// ====================================================================
// Simplified Search Result Components (No changes needed here)
// ====================================================================
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
    // Generate AI suggestions based on the search results
    const generateAISuggestions = (results) => {
        if (!results || results.length === 0) return [];
        
        const suggestions = [];
        const topics = new Set();
        
        // Extract topics from result titles and content
        results.forEach(result => {
            const title = result.title?.toLowerCase() || '';
            const content = result.content?.toLowerCase() || '';
            
            // Extract potential topics (simple keyword extraction)
            const words = [...title.split(' '), ...content.split(' ')]
                .filter(word => word.length > 3)
                .filter(word => !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'they', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'about', 'many', 'then', 'them', 'these', 'some', 'what', 'more', 'very', 'when', 'just', 'into', 'over', 'also', 'only', 'first', 'after', 'most', 'make', 'like', 'through', 'back', 'years', 'where', 'much', 'before', 'good', 'even', 'those', 'work', 'life', 'being', 'well', 'should', 'now', 'people', 'here', 'think', 'still', 'take', 'every', 'both', 'between', 'never', 'become', 'always', 'those', 'often', 'sometimes', 'usually', 'another', 'world', 'area', 'family', 'month', 'music', 'water', 'answer', 'study', 'learn', 'school', 'important', 'until', 'money', 'story', 'young', 'example', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'book', 'carry', 'took', 'science', 'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'stop', 'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour', 'better', 'true', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'oh', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'thousand', 'ago', 'ran', 'check', 'game', 'shape', 'equate', 'hot', 'miss', 'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language', 'among', 'grand', 'ball', 'yet', 'wave', 'drop', 'heart', 'am', 'present', 'heavy', 'dance', 'engine', 'position', 'arm', 'wide', 'sail', 'material', 'size', 'vary', 'settle', 'speak', 'weight', 'general', 'ice', 'matter', 'circle', 'pair', 'include', 'divide', 'syllable', 'felt', 'perhaps', 'pick', 'sudden', 'count', 'square', 'reason', 'length', 'represent', 'art', 'subject', 'region', 'energy', 'hunt', 'probable', 'bed', 'brother', 'egg', 'ride', 'cell', 'believe', 'fraction', 'forest', 'sit', 'race', 'window', 'store', 'summer', 'train', 'sleep', 'prove', 'lone', 'leg', 'exercise', 'wall', 'catch', 'mount', 'wish', 'sky', 'board', 'joy', 'winter', 'sat', 'written', 'wild', 'instrument', 'kept', 'glass', 'grass', 'cow', 'job', 'edge', 'sign', 'visit', 'past', 'soft', 'fun', 'bright', 'gas', 'weather', 'month', 'million', 'bear', 'finish', 'happy', 'hope', 'flower', 'clothe', 'strange', 'gone', 'jump', 'baby', 'eight', 'village', 'meet', 'root', 'buy', 'raise', 'solve', 'metal', 'whether', 'push', 'seven', 'paragraph', 'third', 'shall', 'held', 'hair', 'describe', 'cook', 'floor', 'either', 'result', 'burn', 'hill', 'safe', 'cat', 'century', 'consider', 'type', 'law', 'bit', 'coast', 'copy', 'phrase', 'silent', 'tall', 'sand', 'soil', 'roll', 'temperature', 'finger', 'industry', 'value', 'fight', 'lie', 'beat', 'excite', 'natural', 'view', 'sense', 'ear', 'else', 'quite', 'broke', 'case', 'middle', 'kill', 'son', 'lake', 'moment', 'scale', 'loud', 'spring', 'observe', 'child', 'straight', 'consonant', 'nation', 'dictionary', 'milk', 'speed', 'method', 'organ', 'pay', 'age', 'section', 'dress', 'cloud', 'surprise', 'quiet', 'stone', 'tiny', 'climb', 'cool', 'design', 'poor', 'lot', 'experiment', 'bottom', 'key', 'iron', 'single', 'stick', 'flat', 'twenty', 'skin', 'smile', 'crease', 'hole', 'trade', 'melody', 'trip', 'office', 'receive', 'row', 'mouth', 'exact', 'symbol', 'die', 'least', 'trouble', 'shout', 'except', 'wrote', 'seed', 'tone', 'join', 'suggest', 'clean', 'break', 'lady', 'yard', 'rise', 'bad', 'blow', 'oil', 'blood', 'touch', 'grew', 'cent', 'mix', 'team', 'wire', 'cost', 'lost', 'brown', 'wear', 'garden', 'equal', 'sent', 'choose', 'fell', 'fit', 'flow', 'fair', 'bank', 'collect', 'save', 'control', 'decimal', 'gentle', 'woman', 'captain', 'practice', 'separate', 'difficult', 'doctor', 'please', 'protect', 'noon', 'whose', 'locate', 'ring', 'character', 'insect', 'caught', 'period', 'indicate', 'radio', 'spoke', 'atom', 'human', 'history', 'effect', 'electric', 'expect', 'crop', 'modern', 'element', 'hit', 'student', 'corner', 'party', 'supply', 'bone', 'rail', 'imagine', 'provide', 'agree', 'thus', 'capital', 'won', 'chair', 'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate', 'guess', 'necessary', 'sharp', 'wing', 'create', 'neighbor', 'wash', 'bat', 'rather', 'crowd', 'corn', 'compare', 'poem', 'string', 'bell', 'depend', 'meat', 'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin', 'triangle', 'planet', 'hurry', 'chief', 'colony', 'clock', 'mine', 'tie', 'enter', 'major', 'fresh', 'search', 'send', 'yellow', 'gun', 'allow', 'print', 'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose', 'arrive', 'master', 'track', 'parent', 'shore', 'division', 'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat', 'glad', 'original', 'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer', 'segment', 'slave', 'duck', 'instant', 'market', 'degree', 'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur', 'support', 'speech', 'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient', 'teeth', 'shell', 'neck'].includes(word));
            
            words.forEach(word => {
                if (word.length > 3) topics.add(word);
            });
        });
        
        // Generate 5 suggestions based on the topics
        const topicArray = Array.from(topics).slice(0, 10);
        if (topicArray.length > 0) {
            const suggestionTemplates = [
                `Learn more about ${topicArray[0]}`,
                `Explore ${topicArray[1] || topicArray[0]} trends`,
                `Latest news on ${topicArray[2] || topicArray[0]}`,
                `Research ${topicArray[3] || topicArray[0]} developments`,
                `Compare ${topicArray[4] || topicArray[0]} options`
            ];
            
            return suggestionTemplates.slice(0, 5);
        }
        
        // Fallback suggestions if no topics found
        return [
            "Explore related topics",
            "Find more information",
            "Discover similar content",
            "Research further details",
            "Compare different sources"
        ];
    };

    const aiSuggestions = generateAISuggestions(results);

    return (
        <div className="my-4">
            {/* AI-Generated Suggestions with Magnifying Glass */}
            {aiSuggestions.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs text-slate-500 dark:text-gray-400 mb-2 px-1">
                        Suggested searches
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                        {aiSuggestions.map((suggestion, index) => (
                            <button 
                                key={index} 
                                onClick={() => onSearchSuggestionClick && onSearchSuggestionClick(suggestion)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 transition-all duration-200 border border-blue-200/50 dark:border-blue-700/30 shadow-sm cursor-pointer"
                            >
                                <Search size={12} className="text-blue-600 dark:text-blue-400" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Search Results Header */}
            <div className="text-xs text-slate-500 dark:text-gray-400 mb-2 px-1">
                Search results
            </div>
            
            {/* Original Search Queries (if they exist) */}
            {searchQueries && searchQueries.length > 0 && (
                <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-2">
                    {searchQueries.map((query, index) => (
                        <button 
                            key={index} 
                            onClick={() => onSearchSuggestionClick && onSearchSuggestionClick(query)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                        >
                            <Search size={12} />
                            {query}
                        </button>
                    ))}
                </div>
            )}

            {/* Articles/Results */}
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
// ====================================================================

const PlainTextCopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            title="Copy message"
            className="p-1 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    );
};

const CodeCopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/30 text-slate-300 hover:bg-black/50 hover:text-white transition-all opacity-0 group-hover/code:opacity-100"
            title="Copy code"
        >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
    );
};

// Custom LaTeX component for rendering math expressions
const LaTeXRenderer = ({ children, display = false }) => {
    try {
        const cleanContent = children.toString().trim();
        
        if (!cleanContent) {
            return null; // Don't render anything for empty content
        }
        
        // Handle some common edge cases
        const processedContent = cleanContent
            .replace(/\\n/g, '\\\\') // Fix newlines in LaTeX
            .replace(/\\t/g, '\\quad') // Replace tabs with quad spacing
            .trim();
        
        if (display) {
            return <BlockMath math={processedContent} />;
        } else {
            return <InlineMath math={processedContent} />;
        }
    } catch (error) {
        // Fallback: try to render as plain text with LaTeX formatting
        try {
            const fallbackContent = children.toString()
                .replace(/\\/g, '\\\\') // Escape backslashes
                .replace(/\{/g, '\\{') // Escape braces
                .replace(/\}/g, '\\}') // Escape braces
                .trim();
            
            if (display) {
                return <BlockMath math={fallbackContent} />;
            } else {
                return <InlineMath math={fallbackContent} />;
            }
        } catch (fallbackError) {
            // If all else fails, show the raw content
            return (
                <code className="text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded text-xs">
                    {children}
                </code>
            );
        }
    }
};

// Inline CapabilityIcons for model badges
const CapabilityIcons = ({ capabilities = {}, size = 14 }) => (
    <div className="flex items-center gap-1.5 text-slate-400">
        {capabilities?.vision && <Eye size={size} className="text-green-400" title="Vision" />}
        {capabilities?.reasoning && <Brain size={size} className="text-purple-400" title="Reasoning" />}
        {capabilities?.code && <Code size={size} className="text-orange-400" title="Code" />}
    </div>
);

const LanguageLabel = ({ language }) => (
    <div className="absolute top-0 left-3 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-0.5 rounded-b-md border border-t-0 border-slate-200 dark:border-slate-700">
        {language}
    </div>
);

const ChatMessage = React.memo(({
    id, text, sender, editCount, imageUrl, usedWebSearch, modelId,
    handleUpdateMessage, handleDeleteMessage, onImageClick,
    handleRegenerate, handleBranch,
    searchResults, fileName, fileType, reasoning,
    isStreaming, handleSearchSuggestionClick, isGuest = false,
}) => {
    const isUser = sender === 'user';
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [showRegenModelSelector, setShowRegenModelSelector] = useState(false);
    const [showBranchModelSelector, setShowBranchModelSelector] = useState(false);
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const [showReasoning, setShowReasoning] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const modelDetails = allModels.find(m => m.id === modelId);
    const isAI = sender === 'ai';
    const hasSearchResults = isAI && searchResults && (
        (searchResults.results && searchResults.results.length > 0) || 
        (Array.isArray(searchResults) && searchResults.length > 0)
    );
    const hasReasoning = isAI && reasoning && reasoning.trim() !== '';

    // Detect current theme
    const isDarkMode = () => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    };
    
    // Custom color schemes for code blocks
    const lightModeCodeColors = {
        backgroundColor: '#fdf2f8', // Light pink background
        color: '#374151', // Dark gray text
        borderColor: '#f472b6' // Pink border
    };
    
    const darkModeCodeColors = {
        backgroundColor: '#1a1625', // Purple-ish background
        color: '#e5e7eb',
        borderColor: '#7c3aed'
    };
    
    const currentCodeColors = isDarkMode() ? darkModeCodeColors : lightModeCodeColors;

    // Create custom syntax style for light mode with proper pink background
    const customLightStyle = {
        ...prism,
        'pre[class*="language-"]': {
            ...prism['pre[class*="language-"]'],
            background: lightModeCodeColors.backgroundColor,
            color: lightModeCodeColors.color,
            border: `1px solid ${lightModeCodeColors.borderColor}`,
        },
        'code[class*="language-"]': {
            ...prism['code[class*="language-"]'],
            background: 'transparent', // Make inline code background transparent
            color: lightModeCodeColors.color,
        },
        // Override token colors for better contrast on light pink background
        '.token.comment': { color: '#6b7280' },
        '.token.prolog': { color: '#6b7280' },
        '.token.doctype': { color: '#6b7280' },
        '.token.cdata': { color: '#6b7280' },
        '.token.punctuation': { color: '#374151' },
        '.token.property': { color: '#dc2626' },
        '.token.tag': { color: '#dc2626' },
        '.token.constant': { color: '#dc2626' },
        '.token.symbol': { color: '#dc2626' },
        '.token.deleted': { color: '#dc2626' },
        '.token.boolean': { color: '#059669' },
        '.token.number': { color: '#059669' },
        '.token.selector': { color: '#7c3aed' },
        '.token.attr-name': { color: '#7c3aed' },
        '.token.string': { color: '#0891b2' },
        '.token.char': { color: '#0891b2' },
        '.token.builtin': { color: '#0891b2' },
        '.token.inserted': { color: '#0891b2' },
        '.token.operator': { color: '#374151' },
        '.token.entity': { color: '#374151' },
        '.token.url': { color: '#374151' },
        '.token.atrule': { color: '#7c3aed' },
        '.token.attr-value': { color: '#0891b2' },
        '.token.keyword': { color: '#dc2626' },
        '.token.function': { color: '#7c3aed' },
        '.token.class-name': { color: '#dc2626' },
        '.token.regex': { color: '#059669' },
        '.token.important': { color: '#dc2626', fontWeight: 'bold' },
        '.token.variable': { color: '#374151' }
    };
    
    const syntaxStyle = isDarkMode() ? vscDarkPlus : customLightStyle;

    const handleSave = async () => {
        if (editText.trim() === text.trim() || editText.trim() === '') {
            setIsEditing(false);
            return;
        }
        await handleUpdateMessage(id, editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(text);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <motion.div
            className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : ''}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {!isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-purple-200 dark:bg-purple-900/50">
                    <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
            )}

            <div className={`group relative max-w-2xl ${isUser ? 'flex flex-col items-end' : 'w-full flex flex-col items-start'}`}>
                {!isUser && hasReasoning && (
                    <div className="mb-3 w-full">
                        <button
                            onClick={() => setShowReasoning(!showReasoning)}
                            className="flex items-center gap-2 px-2 py-0.5 border border-slate-300 dark:border-slate-600 rounded-md text-xs text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span>Reasoning</span>
                            <motion.div
                                animate={{ rotate: showReasoning ? 0 : -90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={14} />
                            </motion.div>
                        </button>
                        <motion.div
                            initial={false}
                            animate={{
                                height: showReasoning ? 'auto' : 0,
                                opacity: showReasoning ? 1 : 0,
                                marginTop: showReasoning ? '0.5rem' : '0rem'
                            }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                             <div className="prose prose-xs prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800/30 rounded-md border border-slate-200 dark:border-slate-700/50">
                                <ReactMarkdown>
                                    {reasoning}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    </div>
                )}
                
                {(imageUrl || (fileName && fileType === 'application/pdf')) && !isEditing && (
                    <div className="mb-2">
                        {imageUrl ? (
                            <div
                                className="relative group/image"
                                onMouseEnter={() => setIsHoveringImage(true)}
                                onMouseLeave={() => setIsHoveringImage(false)}
                            >
                                <GlassPanel className="p-1 rounded-lg overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={imageUrl}
                                            alt="User upload"
                                            className="rounded-md w-48 h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => onImageClick(imageUrl)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isHoveringImage ? 1 : 0 }}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center"
                                        >
                                            <button
                                                onClick={() => onImageClick(imageUrl)}
                                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                                title="View full size"
                                            >
                                                <Maximize2 size={20} />
                                            </button>
                                        </motion.div>
                                    </div>
                                </GlassPanel>
                            </div>
                        ) : (
                            <GlassPanel className="p-2 inline-flex items-center gap-3 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                                <FileText size={20} className="text-slate-600 dark:text-slate-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{fileName}</span>
                            </GlassPanel>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-3 w-full"
                    >
                        <GlassPanel className="p-1 w-full" style={{ borderRadius: '1rem 1rem 0 1rem' }}>
                            <div className="px-3 py-1">
                                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-gray-200">
                                    <div className="p-1.5 rounded-lg bg-white/20 dark:bg-gray-700/40">
                                        <Edit size={14} />
                                    </div>
                                    <span className="font-medium text-sm">Edit Message</span>
                                </div>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent text-slate-800 dark:text-gray-100 focus:outline-none resize-none border-none placeholder-slate-500 dark:placeholder-gray-400"
                                    rows={Math.max(3, editText.split('\n').length)}
                                    autoFocus
                                    placeholder="Type your message..."
                                />
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10 dark:border-gray-700/30">
                                    <span className="text-xs text-slate-600 dark:text-gray-400">
                                        Press Ctrl+Enter to save • Esc to cancel
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 transition-colors"
                                            title="Cancel"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="p-2 rounded-full bg-gradient-to-r from-blue-500/80 to-sky-500/80 hover:from-blue-600/80 hover:to-sky-600/80 text-white transition-all duration-150 shadow-lg backdrop-blur-sm border border-blue-400/30"
                                            title="Save"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.div>
                ) : (
                    <>
                        {isUser && text && (
                             <GlassPanel className="p-1" style={{ borderRadius: '1rem 1rem 0 1rem' }}>
                                <div className="prose prose-sm prose-slate dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none px-3 py-1 text-slate-800 dark:text-white">
                                    {text}
                                </div>
                            </GlassPanel>
                        )}

                        {!isUser && (text || isStreaming) && (
                            <div className="w-full">
                                <div className="prose prose-sm prose-slate dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none text-slate-800 dark:text-white">
                                    {(() => {
                                        if (!text) {
                                            return null;
                                        }
                                        
                                        // Process LaTeX directly
                                        const mathRegex = /(\$\$[\s\S]*?\$\$)|(\\\[[\s\S]*?\\\])|(\$[^$\n]+?\$)|(\\\([\s\S]+?\\\))/g;
                                        const matches = Array.from(text.matchAll(mathRegex));
                                        
                                        if (matches.length === 0) {
                                            // No LaTeX found, use ReactMarkdown normally
                                            return (
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const codeString = String(children).replace(/\n$/, '');

                                                            if (!inline && match) {
                                                                return (
                                                                    <div className="relative group/code my-4 rounded-xl overflow-hidden">
                                                                        <CodeCopyButton textToCopy={codeString} />
                                                                        <LanguageLabel language={match[1]} />
                                                                        <SyntaxHighlighter
                                                                            children={codeString}
                                                                            style={syntaxStyle}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            className="custom-code-scrollbar !pt-8"
                                                                            customStyle={{
                                                                                margin: 0,
                                                                                padding: '1.25rem',
                                                                                borderRadius: '0.75rem',
                                                                                backgroundColor: currentCodeColors.backgroundColor
                                                                            }}
                                                                            {...props}
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <code className="bg-slate-200 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-red-300 px-1.5 py-1 rounded-md" {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {text}
                                                </ReactMarkdown>
                                            );
                                        }
                                        
                                        // Process content with LaTeX
                                        let lastIndex = 0;
                                        const elements = [];
                                        
                                        matches.forEach((match, index) => {
                                            // Add text before the match
                                            if (match.index > lastIndex) {
                                                const beforeText = text.slice(lastIndex, match.index);
                                                if (beforeText.trim()) {
                                                    elements.push(
                                                        <ReactMarkdown
                                                            key={`text-${index}`}
                                                            components={{
                                                                code({ node, inline, className, children, ...props }) {
                                                                    const match = /language-(\w+)/.exec(className || '');
                                                                    const codeString = String(children).replace(/\n$/, '');

                                                                    if (!inline && match) {
                                                                        return (
                                                                            <div className="relative group/code my-4 rounded-xl overflow-hidden">
                                                                                <CodeCopyButton textToCopy={codeString} />
                                                                                <LanguageLabel language={match[1]} />
                                                                                <SyntaxHighlighter
                                                                                    children={codeString}
                                                                                    style={syntaxStyle}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    className="custom-code-scrollbar !pt-8"
                                                                                    customStyle={{
                                                                                        margin: 0,
                                                                                        padding: '1.25rem',
                                                                                        borderRadius: '0.75rem',
                                                                                        backgroundColor: currentCodeColors.backgroundColor
                                                                                    }}
                                                                                    {...props}
                                                                                />
                                                                            </div>
                                                                        );
                                                                    }
                                                                    
                                                                    return (
                                                                        <code className="bg-slate-200 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-red-300 px-1.5 py-1 rounded-md" {...props}>
                                                                            {children}
                                                                        </code>
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {beforeText}
                                                        </ReactMarkdown>
                                                    );
                                                }
                                            }
                                            
                                            // Process the LaTeX match
                                            const blockContent = match[1] || match[2]; // $$...$$ or \[...\]
                                            const inlineContent = match[3] || match[4]; // $...$ or \(...\)
                                            
                                            if (blockContent) {
                                                const mathContent = blockContent.substring(2, blockContent.length - 2).trim();
                                                elements.push(
                                                    <LaTeXRenderer key={`math-${index}`} display={true}>
                                                        {mathContent}
                                                    </LaTeXRenderer>
                                                );
                                            } else if (inlineContent) {
                                                const delimiterLength = inlineContent.startsWith('$') ? 1 : 2;
                                                const mathContent = inlineContent.substring(delimiterLength, inlineContent.length - delimiterLength).trim();
                                                elements.push(
                                                    <LaTeXRenderer key={`math-${index}`} display={false}>
                                                        {mathContent}
                                                    </LaTeXRenderer>
                                                );
                                            }
                                            
                                            lastIndex = match.index + match[0].length;
                                        });
                                        
                                        // Add remaining text
                                        if (lastIndex < text.length) {
                                            const afterText = text.slice(lastIndex);
                                            if (afterText.trim()) {
                                                elements.push(
                                                    <ReactMarkdown
                                                        key={`text-after`}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const codeString = String(children).replace(/\n$/, '');

                                                                if (!inline && match) {
                                                                    return (
                                                                        <div className="relative group/code my-4 rounded-xl overflow-hidden">
                                                                            <CodeCopyButton textToCopy={codeString} />
                                                                            <LanguageLabel language={match[1]} />
                                                                            <SyntaxHighlighter
                                                                                children={codeString}
                                                                                style={syntaxStyle}
                                                                                language={match[1]}
                                                                                PreTag="div"
                                                                                className="custom-code-scrollbar !pt-8"
                                                                                customStyle={{
                                                                                    margin: 0,
                                                                                    padding: '1.25rem',
                                                                                    borderRadius: '0.75rem',
                                                                                    backgroundColor: currentCodeColors.backgroundColor
                                                                                }}
                                                                                {...props}
                                                                            />
                                                                        </div>
                                                                    );
                                                                }
                                                                
                                                                return (
                                                                    <code className="bg-slate-200 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-red-300 px-1.5 py-1 rounded-md" {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {afterText}
                                                    </ReactMarkdown>
                                                );
                                            }
                                        }
                                        
                                        return <>{elements}</>;
                                    })()}
                                    {isStreaming && text && text.length > 0 && <span className="inline-block w-2 h-4 bg-slate-800 dark:bg-white ml-1 animate-pulse"></span>}
                                </div>

                                {hasSearchResults && (
                                    <IntegratedSearchResults 
                                        results={searchResults.results || searchResults} 
                                        searchQueries={searchResults.queries} 
                                        onSearchSuggestionClick={handleSearchSuggestionClick}
                                    />
                                )}

                                {!isUser && !isStreaming && (
                                     <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="pb-2 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/50 w-full"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                                                <button onClick={() => setShowRegenModelSelector(true)} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-gray-200 transition-colors" title="Regenerate with another model">
                                                    <span>via {modelDetails?.name || 'an AI model'}</span>
                                                    <ChevronDown size={14} />
                                                </button>
                                                {modelDetails?.capabilities && (
                                                    <div className="hidden sm:flex">
                                                        <CapabilityIcons capabilities={modelDetails.capabilities} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                {text && <PlainTextCopyButton textToCopy={text} />}
                                                <ActionTooltip text="Regenerate">
                                                    <button onClick={() => handleRegenerate(id, modelId)} className="p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10">
                                                        <Sparkles size={14} />
                                                    </button>
                                                </ActionTooltip>
                                                <ActionTooltip text="Branch Chat">
                                                    <button onClick={() => setShowBranchModelSelector(true)} className="p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10">
                                                        <GitBranch size={14} />
                                                    </button>
                                                </ActionTooltip>
                                                <HierarchicalModelSelector
                                                    isOpen={showRegenModelSelector || showBranchModelSelector}
                                                    title={showRegenModelSelector ? 'Regenerate with...' : 'Branch with...'}
                                                    onClose={() => {setShowRegenModelSelector(false); setShowBranchModelSelector(false);}}
                                                    onSelectModel={(newModelId) => {
                                                        if (showRegenModelSelector) handleRegenerate(id, newModelId);
                                                        if (showBranchModelSelector) handleBranch(id, newModelId);
                                                    }}
                                                    currentModelId={modelId}
                                                    openSettings={() => setIsSettingsOpen(true)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {isUser && (
                            <div className="flex items-center justify-end gap-3 h-8 pr-1 pt-1.5 -mr-1">
                                {usedWebSearch && (
                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 opacity-80">
                                        <Globe size={13} />
                                        <span>Web</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    {editCount > 0 && (
                                        <span className="text-xs text-slate-500 dark:text-gray-500 italic">
                                            (edited)
                                        </span>
                                    )}
                                    <button onClick={() => { setEditText(text); setIsEditing(true); }} className="p-1 rounded-full text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Edit message">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteMessage(id)} className="p-1 rounded-full text-slate-500 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete message">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-200 dark:bg-blue-900/50">
                    <User size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
            )}
        </motion.div>
    );
});

export default ChatMessage;