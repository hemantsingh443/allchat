import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import { LoaderCircle, ShieldAlert, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const SharePage = () => {
    const { shareId } = useParams();
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const chatContentRef = useRef(null);

    useEffect(() => {
        const fetchSharedChat = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/share/${shareId}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Chat not found or sharing is disabled.');
                }
                const data = await res.json();
                setChat(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (shareId) {
            fetchSharedChat();
        }
    }, [shareId]);

    const handleExportPDF = () => {
        if (!chatContentRef.current || isExporting) return;
        setIsExporting(true);

        const content = chatContentRef.current;
        const originalHeight = content.style.height;
        // Temporarily set height to auto to capture full content
        content.style.height = 'auto';

        html2canvas(content, { 
            backgroundColor: document.documentElement.classList.contains('dark') ? '#111015' : '#f8fafc',
            scale: 1.5, // A good balance of quality and size
            useCORS: true,
            windowHeight: content.scrollHeight, // Ensure it captures full height
            scrollY: -window.scrollY
        }).then(canvas => {
            // Restore original height after capture
            content.style.height = originalHeight;

            const imgData = canvas.toDataURL('image/jpeg', 0.92); // Use JPEG for smaller file size
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${chat.title.replace(/ /g, '_') || 'shared-chat'}.pdf`);
            setIsExporting(false);
        }).catch(err => {
            console.error("PDF export failed:", err);
            setIsExporting(false);
        });
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#111015]">
            <header className="py-3 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-lg font-bold text-slate-800 dark:text-gray-100 truncate pr-4">
                        {chat ? chat.title : 'Shared Chat'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExportPDF}
                            disabled={!chat || loading || isExporting}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isExporting ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
                            {isExporting ? 'Exporting...' : 'Export as PDF'}
                        </button>
                        <Link to="/" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            Back to AllChat
                        </Link>
                    </div>
                </div>
            </header>
            <main className="py-8 px-4">
                <div ref={chatContentRef} className="max-w-4xl mx-auto space-y-6">
                    {loading && (
                        <div className="flex justify-center items-center gap-2 text-slate-500">
                            <LoaderCircle className="animate-spin" />
                            <span>Loading chat...</span>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center gap-3">
                            <ShieldAlert />
                            <span>{error}</span>
                        </div>
                    )}
                    {chat && chat.messages.map(msg => (
                        <ChatMessage
                            key={msg.id}
                            id={msg.id}
                            text={msg.content}
                            sender={msg.sender}
                            modelId={msg.modelId}
                            imageUrl={msg.imageUrl}
                            fileName={msg.fileName}
                            fileType={msg.fileType}
                            handleUpdateMessage={() => {}}
                            handleDeleteMessage={() => {}}
                            handleRegenerate={() => {}}
                            handleBranch={() => {}}
                            onImageClick={() => {}}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default SharePage;