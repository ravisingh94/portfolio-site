'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Send, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from './auth/AuthContext';
import { useCredits } from './auth/CreditContext';
import { v4 as uuidv4 } from 'uuid';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
    const { user, isAuthenticated } = useAuth();
    const { updateCredits, creditsAvailable } = useCredits();
    const [message, setMessage] = useState('');
    const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
    const [messages, setMessages] = useState<Message[]>([{
        id: 'init',
        role: 'assistant',
        content: 'Connecting to Neura Core...',
        timestamp: Date.now()
    }]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStateful, setIsStateful] = useState(false);
    const [threadId, setThreadId] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [guestQuestionCount, setGuestQuestionCount] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 384, height: 500 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragControls = useDragControls();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const MAX_GUEST_QUESTIONS = 10;

    // Health Check on Mount
    useEffect(() => {
        const checkBackendHealth = async () => {
            try {
                const response = await fetch('http://localhost:8000/health', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'healthy') {
                        setBackendHealthy(true);
                        setMessages([{
                            id: 'init',
                            role: 'assistant',
                            content: 'Initialization Complete. How can I assist your workflow today?',
                            timestamp: Date.now()
                        }]);
                    } else {
                        throw new Error('Backend unhealthy');
                    }
                } else {
                    throw new Error('Health check failed');
                }
            } catch (error) {
                console.error('Backend health check failed:', error);
                setBackendHealthy(false);
                setMessages([{
                    id: 'init',
                    role: 'assistant',
                    content: '⚠️ Neura Core offline. Backend services unavailable. Please check if the chatbot server is running.',
                    timestamp: Date.now()
                }]);
            }
        };

        checkBackendHealth();
    }, []);

    // Initialize Thread ID and Username
    useEffect(() => {
        // Handle Thread ID
        const storedThreadId = sessionStorage.getItem('neura_thread_id');
        if (storedThreadId) {
            setThreadId(storedThreadId);
        } else {
            const newThreadId = uuidv4();
            setThreadId(newThreadId);
            sessionStorage.setItem('neura_thread_id', newThreadId);
        }

        // Handle Username and Guest Question Count
        if (isAuthenticated && user) {
            setUsername(user.getUsername());
            // Reset guest count for authenticated users
            setGuestQuestionCount(0);
        } else {
            const storedGuestId = sessionStorage.getItem('neura_guest_id');
            if (storedGuestId) {
                setUsername(storedGuestId);
            } else {
                const newGuestId = `guest_${uuidv4().slice(0, 8)}`;
                setUsername(newGuestId);
                sessionStorage.setItem('neura_guest_id', newGuestId);
            }

            // Load guest question count from sessionStorage
            const storedCount = sessionStorage.getItem('neura_guest_question_count');
            setGuestQuestionCount(storedCount ? parseInt(storedCount, 10) : 0);
        }
    }, [isAuthenticated, user]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        // Check if backend is available
        if (backendHealthy === false) {
            const errorMsg: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: '⚠️ Cannot send message. Neura Core backend is offline. Please start the server and refresh.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
            return;
        }

        // Check if authenticated user has credits remaining
        if (isAuthenticated && creditsAvailable <= 0) {
            const creditMsg: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: '⚠️ Daily available credits used. Please come back tomorrow to continue chatting!',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, creditMsg]);
            return;
        }

        // Check guest question limit
        if (!isAuthenticated && guestQuestionCount >= MAX_GUEST_QUESTIONS) {
            const limitMsg: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: 'You have reached the maximum of 10 questions for guests. Please log in to continue unlimited conversations.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, limitMsg]);
            return;
        }

        const userMsg: Message = {
            id: uuidv4(),
            role: 'user',
            content: message,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userMsg.content,
                    username: username,
                    thread_id: threadId,
                    stateful: isStateful
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Extract the answer from the API response
            const botContent = data.answer || data.response || data.message || JSON.stringify(data);

            const botMsg: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: botContent,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMsg]);

            // Update token usage in database if available and user is authenticated
            if (data.token_usage?.total_tokens && isAuthenticated) {
                try {
                    await updateCredits(data.token_usage.total_tokens);
                    console.log('✅ Token usage updated:', data.token_usage.total_tokens);
                } catch (error) {
                    console.error('❌ Failed to update token usage:', error);
                }
            }

            // Increment guest question count
            if (!isAuthenticated) {
                const newCount = guestQuestionCount + 1;
                setGuestQuestionCount(newCount);
                sessionStorage.setItem('neura_guest_question_count', newCount.toString());
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: 'Connection interrupted. Neura Core unavailable.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
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
                    className="fixed bottom-40 right-6 backdrop-blur-xl bg-gray-900/90 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] border border-white/10 flex flex-col overflow-hidden z-[60]"
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
                        className="relative bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 p-5 flex items-center justify-between overflow-hidden cursor-move flex-shrink-0"
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
                            {/* Stateful Toggle */}
                            <div className="flex items-center gap-2 mr-2 pointer-events-auto group relative">
                                <button
                                    onClick={() => setIsStateful(!isStateful)}
                                    className={`relative flex items-center justify-center p-1.5 rounded-lg transition-all duration-300 border ${isStateful
                                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    title={isStateful ? "Stateful Mode: History Enabled" : "Stateless Mode: No History"}
                                >
                                    {isStateful ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <span className="absolute -bottom-8 right-0 bg-black/80 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 text-cyan-100">
                                    {isStateful ? "History ON" : "History OFF"}
                                </span>
                            </div>

                            <button
                                onClick={onClose}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-2 transition-all duration-300 border border-white/5 backdrop-blur-sm pointer-events-auto"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Guest Question Limit Banner */}
                    {!isAuthenticated && (
                        <div className={`px-4 py-2.5 border-t border-white/10 ${guestQuestionCount >= MAX_GUEST_QUESTIONS
                            ? 'bg-red-900/30 border-red-500/30'
                            : guestQuestionCount >= 7
                                ? 'bg-orange-900/20 border-orange-500/20'
                                : 'bg-blue-900/20 border-blue-500/20'
                            } backdrop-blur-sm flex-shrink-0`}>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-gray-200 flex items-center gap-1.5">
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${guestQuestionCount >= MAX_GUEST_QUESTIONS
                                        ? 'bg-red-400'
                                        : guestQuestionCount >= 7
                                            ? 'bg-orange-400 animate-pulse'
                                            : 'bg-blue-400'
                                        }`}></span>
                                    <span className="font-medium">
                                        {guestQuestionCount >= MAX_GUEST_QUESTIONS
                                            ? 'Limit Reached'
                                            : `${MAX_GUEST_QUESTIONS - guestQuestionCount} questions remaining`
                                        }
                                    </span>
                                </p>
                                {guestQuestionCount >= MAX_GUEST_QUESTIONS && (
                                    <span className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider">
                                        Login for unlimited
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages Area with subtle grid pattern */}
                    <div className="flex-1 p-6 overflow-y-auto relative custom-scrollbar flex flex-col gap-4">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`relative z-10 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-sm'
                                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="relative z-10 flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm backdrop-blur-md flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                    <span className="text-xs text-gray-400">Processing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Futuristic Input Area */}
                    <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md flex-shrink-0">
                        <div className="flex gap-2">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Execute command..."
                                    disabled={isLoading}
                                    className="w-full bg-white/5 text-white rounded-xl pl-4 pr-3 py-2 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300 placeholder-gray-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !message.trim()}
                                className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl aspect-square w-[38px] flex items-center justify-center hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 active:scale-95 group border border-cyan-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
