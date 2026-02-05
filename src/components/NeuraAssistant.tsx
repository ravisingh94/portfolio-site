'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ChatWindow from './ChatWindow';

const NeuraAssistant: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleIconClick = () => {
        setIsChatOpen(true);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
    };

    return (
        <>
            {/* Neura AI Assistant Icon */}
            <motion.div
                onClick={handleIconClick}
                className="fixed bottom-6 right-6 z-50 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    className="relative w-24 h-24 md:w-28 md:h-28"
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src="/neura.png"
                        alt="Neura AI Assistant"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl -z-10" />
                </motion.div>
            </motion.div>

            <ChatWindow isOpen={isChatOpen} onClose={handleChatClose} />
        </>
    );
};

export default NeuraAssistant;
