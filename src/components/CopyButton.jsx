// src/components/CopyButton.jsx
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000); 
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 transition-colors"
            aria-label="Copy code to clipboard"
        >
            {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </button>
    );
};

export default CopyButton;