'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatWindow from './ChatWindow';
import Image from 'next/image';

type AnimationState = 'walking' | 'drinkingCoffee' | 'leaning';

export default function RatAssistant() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>('walking');
    const [currentFrame, setCurrentFrame] = useState(0);
    const [walkPosition, setWalkPosition] = useState(0); // Position from 0 to 100 (percent)
    const [direction, setDirection] = useState<'rightToLeft' | 'leftToRight'>('rightToLeft');
    const [arrivalDuration, setArrivalDuration] = useState(1);

    const WALK_PACE = 10; // Speed in % of screen width (vw) per second
    const ANIMATION_INTERVAL = 300; // Switch between frames every 300ms
    const MOVE_INTERVAL = 30; // Update position every 30ms for smooth movement
    const MOVE_STEP = (WALK_PACE * MOVE_INTERVAL) / 1000; // Derived distance per step
    const WALK_DURATION = 5000; // Walk for 5 seconds
    const COFFEE_DURATION = 3000; // Drink coffee for 3 seconds

    // Image assets for each state
    const images = {
        walking: ['/walk1.png', '/walk2.png'],
        drinkingCoffee: ['/drink_coffee1.png', '/drink_coffee2.png'],
        leaning: ['/lean_against_wall1.png', '/lean_against_wall2.png'],
    };

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
            stateTimer = setTimeout(() => {
                // Switch to drinking coffee (movement continues!)
                setAnimationState('drinkingCoffee');
                stateTimer = setTimeout(() => {
                    // Loop back to walking
                    cycleAnimations();
                }, COFFEE_DURATION);
            }, WALK_DURATION);
        };

        cycleAnimations();

        return () => clearTimeout(stateTimer);
    }, [isChatOpen]);

    // Frame switching within each state
    useEffect(() => {
        const frameTimer = setInterval(() => {
            setCurrentFrame((prev) => {
                const maxFrames = images[animationState].length;
                return (prev + 1) % maxFrames;
            });
        }, ANIMATION_INTERVAL);

        return () => clearInterval(frameTimer);
    }, [animationState]);

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
        if (walkPosition < chatPositionVw) {
            // Rat is to the left of target, needs to move RIGHT -> Face RIGHT
            setDirection('rightToLeft');
        } else {
            // Rat is to the right of target, needs to move LEFT -> Face LEFT
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

    const currentImage = images[animationState][currentFrame];
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
    };

    // Horizontal offsets to align rat perfectly against the chat wall
    // Positive values shift the image RIGHT.
    const horizontalOffsets: Record<string, number> = {
        '/lean_against_wall1.png': 20, // Shift right by 22px
        '/lean_against_wall2.png': 13, // Shift right by 13px
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
                        width={RAT_SIZE}
                        height={RAT_SIZE}
                        className="drop-shadow-2xl object-bottom"
                        style={{
                            transform: `translate(${currentHorizontalOffset}px, ${currentOffset}px)`,
                        }}
                        priority
                    />
                </div>
            </motion.div>

            <ChatWindow isOpen={isChatOpen} onClose={handleChatClose} />
        </>
    );
}
