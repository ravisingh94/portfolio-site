'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';

type AnimationState = 'walking' | 'drinkingCoffee' | 'leaning' | 'sayingHi';

const WALK_PACE = 10; // vw per second
const ANIMATION_INTERVAL = 300; // Switch between frames every 300ms
const MOVE_INTERVAL = 30; // Update position every 30ms for smooth movement
const MOVE_STEP = (WALK_PACE * MOVE_INTERVAL) / 1000; // Derived distance per step
const WALK_DURATION = 5000; // Walk for 5 seconds
const COFFEE_DURATION = 3000; // Drink coffee for 3 seconds

// Animation frames
const images: Record<AnimationState, string[]> = {
    walking: ['/walk1.png', '/walk2.png'],
    drinkingCoffee: ['/drink_coffee1.png', '/drink_coffee2.png'],
    leaning: ['/lean_against_wall1.png', '/lean_against_wall2.png'],
    sayingHi: ['/sayHi1.png', '/sayHi2.png', '/sayHi3.png'],
};

const speechTexts = [
    "Want to talk? Click me!!",
    "Do you have any query? Click me to talk!!",
    "I'm your AI assistant! Let's chat.",
    "Need help? Just click me!",
    "Hello! How can I assist you today?"
];

const RatAssistant: React.FC = () => {
    // State for animation
    const [frame, setFrame] = useState(0);
    const [animationState, setAnimationState] = useState<AnimationState>('walking');
    const [walkPosition, setWalkPosition] = useState(-20); // Start off-screen left
    const [direction, setDirection] = useState<'leftToRight' | 'rightToLeft' | 'center'>('leftToRight');
    const [isIconsVisible, setIsIconsVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [arrivalDuration, setArrivalDuration] = useState(1); // Default 1s arrival
    const [speechText, setSpeechText] = useState("");

    useEffect(() => {
        setFrame(0); // Reset frame on state change to prevent index mismatch

        let timer: NodeJS.Timeout;

        const animate = () => {
            let delay = 200; // Default fast speed for walking, etc.

            if (animationState === 'leaning') {
                // Random duration between 3-5 seconds (3000-5000ms)
                delay = 3000 + Math.random() * 2000;
            }

            timer = setTimeout(() => {
                setFrame((prev) => (prev + 1) % images[animationState].length);
                animate();
            }, delay);
        };

        animate();

        return () => clearTimeout(timer);
    }, [animationState]);

    // Animation state cycling (walking → coffee → walking...) WHILE STILL MOVING
    useEffect(() => {
        if (isChatOpen) {
            // Keep walking while moving to the chat window
            setAnimationState('walking');
            const timer = setTimeout(() => {
                setAnimationState('leaning');
            }, arrivalDuration * 1000);
            return () => clearTimeout(timer);
        }

        let stateTimer: NodeJS.Timeout;

        const cycleAnimations = () => {
            // Start with walking
            setAnimationState('walking');
            console.log('Rat: Walking');
            stateTimer = setTimeout(() => {
                // Randomly decide next action: Coffee or Say Hi
                const nextAction = Math.random() > 0.5 ? 'drinkingCoffee' : 'sayingHi';

                if (nextAction === 'sayingHi') {
                    const text = speechTexts[Math.floor(Math.random() * speechTexts.length)];
                    setSpeechText(text);
                    console.log('Rat: Saying Hi -', text);
                } else {
                    console.log('Rat: Drinking Coffee');
                }

                setAnimationState(nextAction);

                stateTimer = setTimeout(() => {
                    // Loop back to walking
                    cycleAnimations();
                }, 4000); // Spend 4s doing the action (drinking or saying hi)
            }, 2000 + Math.random() * 3000); // Walk for 2-5 seconds (More frequent updates)
        };

        cycleAnimations();

        return () => clearTimeout(stateTimer);
    }, [isChatOpen]);



    // Continuous movement (NEVER STOPS) - only pauses when chat is open
    useEffect(() => {
        if (isChatOpen) {
            return; // Stop only when chat is open
        }

        const walkTimer = setInterval(() => {
            setWalkPosition((prev) => {
                let newPos = prev;

                if (direction === 'rightToLeft') {
                    // Moving from right (0) to left (88) - restricted from 95 to prevent hiding
                    newPos = prev + MOVE_STEP;
                    if (newPos >= 88) {
                        // Reached left edge, reverse direction
                        setDirection('leftToRight');
                        return 88;
                    }
                } else {
                    // Moving from left (88) to right (0)
                    newPos = prev - MOVE_STEP;
                    if (newPos <= 0) {
                        // Reached right edge, reverse direction
                        setDirection('rightToLeft');
                        return 0;
                    }
                }

                return newPos;
            });
        }, MOVE_INTERVAL);

        return () => clearInterval(walkTimer);
    }, [direction, isChatOpen]);

    const handleRatClick = () => {
        // Calculate dynamic duration based on distance to ensure constant walking speed
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const chatPositionVw = (410 / screenWidth) * 100;
        const distanceToTravelVw = Math.abs(walkPosition - chatPositionVw);
        const duration = Math.max(0.5, distanceToTravelVw / WALK_PACE); // Ensure at least 0.5s to avoid instant snap

        // Determine direction to face during transit
        // Determine direction to face during transit
        if (walkPosition < chatPositionVw) {
            // Rat is to the RIGHT of target (closer to 0) -> Move LEFT
            // Face LEFT
            setDirection('rightToLeft');
        } else {
            // Rat is to the LEFT of target.
            // Needs to move RIGHT.
            // So face RIGHT (leftToRight).
            setDirection('leftToRight');
        }

        setArrivalDuration(duration);
        setIsChatOpen(true);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        // Resume walking from the chat window position (410px from right)
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const chatPositionVw = (410 / screenWidth) * 100;

        setWalkPosition(chatPositionVw);
        setDirection('rightToLeft'); // Walk away from the wall
        setAnimationState('walking');
    };

    // Calculate container styles with hardware acceleration
    const getContainerStyles = () => {
        const base = {
            bottom: '24px',
            willChange: 'transform',
        };

        if (isChatOpen) {
            return {
                ...base,
                right: '410px',
                transform: 'translate3d(0, 0, 0)',
                transition: `right ${arrivalDuration}s linear, transform ${arrivalDuration}s linear`,
            };
        }

        return {
            ...base,
            right: '0',
            // Use translateX with vw for smooth glide without layout recalculation
            transform: `translate3d(-${walkPosition}vw, 0, 0)`,
        };
    };

    // Safely calculate frame to avoid index out of bounds during state transitions
    const safeFrame = frame % images[animationState].length;
    const currentImage = images[animationState][safeFrame];
    const containerStyles = getContainerStyles();

    // FIX: Rat faces RIGHT by default.
    // Flip when moving LEFT (rightToLeft).
    // When leaning, always face RIGHT (towards wall) -> handled by fixed logic or ensure direction is correct on arrival?
    // Actually, leaning frames might need specific orientation, but for now let's respect direction.
    // WAIt: When leaning, we want to face the wall (Right).
    // So if animationState is 'leaning', force face RIGHT?
    // Let's stick to direction for movement, and check leaning.

    // New Logic: 
    // If leaning, ALWAYS face RIGHT (no flip).
    // If not leaning, flip if direction is rightToLeft.
    const shouldFlip = animationState !== 'leaning' && direction === 'rightToLeft';

    // Vertical offsets to align feet perfectly on the ground (measured in px)
    // Positive values shift the image DOWN.
    const verticalOffsets: Record<string, number> = {
        '/walk1.png': 0,
        '/walk2.png': 8,      // Was ~7.7px higher
        '/drink_coffee1.png': 6, // Was ~6.3px higher
        '/drink_coffee2.png': 4, // Was ~4.2px higher
        '/lean_against_wall1.png': -1, // Was ~0.9px lower
        '/lean_against_wall2.png': -1, // Was ~0.9px lower
        '/sayHi1.png': 0,
        '/sayHi2.png': 0,
        '/sayHi3.png': 0,
    };

    // Horizontal offsets to align rat perfectly against the chat wall
    // Positive values shift the image RIGHT.
    const horizontalOffsets: Record<string, number> = {
        '/lean_against_wall1.png': 20, // Shift right by 22px
        '/lean_against_wall2.png': 13, // Shift right by 13px
        '/sayHi1.png': 0,
        '/sayHi2.png': 0,
        '/sayHi3.png': 0,
    };

    const RAT_SIZE = 120; // Adjust this value to change the rat size everywhere
    const BASE_SIZE = 120; // The reference size for existing offsets
    const scale = RAT_SIZE / BASE_SIZE;

    const currentOffset = (verticalOffsets[currentImage] || 0) * scale;
    const currentHorizontalOffset = (horizontalOffsets[currentImage] || 0) * scale;

    return (
        <>
            <motion.div
                onClick={handleRatClick}
                style={containerStyles as any}
                className="fixed z-50 cursor-pointer flex items-end justify-center"
                initial={false}
            >
                <div className="relative flex flex-col items-center">
                    {/* Speech Bubble */}
                    <AnimatePresence>
                        {animationState === 'sayingHi' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                className="absolute bottom-full mb-2 bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-2xl shadow-lg border border-gray-200 whitespace-nowrap z-50 text-sm font-medium"
                                style={{
                                    left: walkPosition < 15 ? 'auto' : '50%',
                                    right: walkPosition < 15 ? 0 : 'auto',
                                    transform: walkPosition < 15 ? 'none' : 'translateX(-50%)',
                                }}
                            >
                                {speechText}
                                <div
                                    className={`absolute top-full -mt-1 border-8 border-transparent border-t-white/90 ${walkPosition < 15 ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div
                        className="relative flex items-end justify-center pointer-events-none"
                        style={{
                            width: RAT_SIZE,
                            height: RAT_SIZE,
                            transform: `scale(${shouldFlip ? -1 : 1}, 1)`,
                            transformOrigin: 'bottom center',
                        }}
                    >
                        <Image
                            src={currentImage}
                            alt="Engineer Rat"
                            fill
                            sizes={`${RAT_SIZE}px`}
                            className="drop-shadow-2xl object-contain object-bottom"
                            style={{
                                transform: `translate(${currentHorizontalOffset}px, ${currentOffset}px)`,
                            }}
                            priority
                        />
                    </div>
                </div>
            </motion.div>

            <ChatWindow isOpen={isChatOpen} onClose={handleChatClose} />
        </>
    );
}

export default RatAssistant;
