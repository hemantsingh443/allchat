import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ScrollToBottomButton = ({ containerRef, activeChatId }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        setIsVisible(false);

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isScrollable = scrollHeight > clientHeight;
            const isScrolledUp = (scrollHeight - scrollTop) > (clientHeight + 200);
            setIsVisible(isScrollable && isScrolledUp);
        };

        const timer = setTimeout(handleScroll, 150);

        container.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            clearTimeout(timer);
            container.removeEventListener('scroll', handleScroll);
        };
    }, [containerRef, activeChatId]);

    const scrollToBottom = () => {
        containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    return (
        <div className="absolute bottom-24 left-0 right-0 w-full flex justify-center pointer-events-none">
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToBottom}
                        className="pointer-events-auto px-4 py-2 flex items-center gap-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 shadow-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-gray-300 backdrop-blur-sm"
                    >
                        <ChevronDown size={16} />
                        Scroll to bottom
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScrollToBottomButton; 