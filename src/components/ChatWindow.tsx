'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
    const [message, setMessage] = useState('');
    const [dimensions, setDimensions] = useState({ width: 384, height: 500 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragControls = useDragControls();

    const handleSend = () => {
        if (message.trim()) {
            console.log('Sending message:', message);
            setMessage('');
        }
    };

    const handleResize = (direction: string, e: React.PointerEvent) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const { width: startWidth, height: startHeight } = dimensions;
        const { x: startXPos, y: startYPos } = position;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startXPos;
            let newY = startYPos;

            if (direction.includes('e')) {
                newWidth = Math.max(320, startWidth + dx);
            } else if (direction.includes('w')) {
                const possibleWidth = Math.max(320, startWidth - dx);
                newX = startXPos + (startWidth - possibleWidth);
                newWidth = possibleWidth;
            }

            if (direction.includes('s')) {
                newHeight = Math.max(400, startHeight + dy);
            } else if (direction.includes('n')) {
                const possibleHeight = Math.max(400, startHeight - dy);
                newY = startYPos + (startHeight - possibleHeight);
                newHeight = possibleHeight;
            }

            setDimensions({ width: newWidth, height: newHeight });
            setPosition({ x: newX, y: newY });
        };

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.body.style.cursor = `${direction}-resize`;
    };

    const resizeHandles = [
        { dir: 'n', className: 'top-0 left-0 w-full h-1.5 cursor-n-resize' },
        { dir: 's', className: 'bottom-0 left-0 w-full h-1.5 cursor-s-resize' },
        { dir: 'e', className: 'top-0 right-0 h-full w-1.5 cursor-e-resize' },
        { dir: 'w', className: 'top-0 left-0 h-full w-1.5 cursor-w-resize' },
        { dir: 'nw', className: 'top-0 left-0 w-4 h-4 cursor-nw-resize z-50' },
        { dir: 'ne', className: 'top-0 right-0 w-4 h-4 cursor-ne-resize z-50' },
        { dir: 'sw', className: 'bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50' },
        { dir: 'se', className: 'bottom-0 right-0 w-4 h-4 cursor-se-resize z-50' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag
                    dragControls={dragControls}
                    dragListener={false}
                    dragMomentum={false}
                    onDrag={(e, info) => {
                        setPosition(prev => ({
                            x: prev.x + info.delta.x,
                            y: prev.y + info.delta.y
                        }));
                    }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: position.y,
                        x: position.x
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-40 right-6 backdrop-blur-xl bg-gray-900/70 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] border border-white/10 flex flex-col overflow-hidden z-[60]"
                    style={{
                        width: dimensions.width,
                        height: dimensions.height,
                        touchAction: 'none'
                    }}
                >
                    {/* Multi-edge resize handles */}
                    {resizeHandles.map(handle => (
                        <div
                            key={handle.dir}
                            className={`absolute ${handle.className} hover:bg-cyan-500/10 transition-colors`}
                            onPointerDown={(e) => handleResize(handle.dir, e)}
                        />
                    ))}

                    {/* Futuristic Header - Drag Handle */}
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="relative bg-gradient-to-r from-cyan-500/80 via-blue-600/80 to-purple-600/80 p-5 flex items-center justify-between overflow-hidden cursor-move flex-shrink-0"
                    >
                        {/* Decorative tech lines */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10" />

                        <div className="flex items-center gap-4 z-10 pointer-events-none">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md" />
                                <Image
                                    src="/neura.png"
                                    alt="Neura"
                                    fill
                                    className="object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-white font-bold text-base tracking-tight">Neura Core</h3>
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                </div>
                                <p className="text-cyan-100/70 text-[10px] font-medium uppercase tracking-widest">Active Intel</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 z-10">
                            <button
                                onClick={onClose}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-2 transition-all duration-300 border border-white/5 backdrop-blur-sm pointer-events-auto"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area with subtle grid pattern */}
                    <div className="flex-1 p-6 overflow-y-auto relative custom-scrollbar">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <div className="relative z-10 text-gray-300 text-sm text-center mt-4 space-y-3">
                            <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                                <p className="text-cyan-400 font-semibold mb-1">Initialization Complete</p>
                                <p className="text-gray-400 text-xs">How can I assist your workflow today?</p>
                            </div>
                        </div>
                    </div>

                    {/* Futuristic Input Area */}
                    <div className="p-4 bg-black/20 border-t border-white/10 backdrop-blur-md flex-shrink-0">
                        <div className="flex gap-2">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Execute command..."
                                    className="w-full bg-white/5 text-white rounded-xl pl-4 pr-3 py-2 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 placeholder-gray-500 text-xs"
                                />
                                <div className="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <button
                                onClick={handleSend}
                                className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl aspect-square w-[38px] flex items-center justify-center hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 active:scale-95 group border border-cyan-400/30"
                            >
                                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
