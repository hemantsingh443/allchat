import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CopyButton = ({ textToCopy, className = '', title = 'Copy to clipboard', iconSize = 16 }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        if (isCopied) return;
        
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
            className={className}
            title={isCopied ? 'Copied!' : title}
            aria-label={title}
        >
            {isCopied ? <Check size={iconSize} className="text-green-400" /> : <Copy size={iconSize} />}
        </button>
    );
};

export default CopyButton;