"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ScreenshotZoomProps {
    screenshotUrl: string | null;
    onAnimationComplete: () => void;
}

export function ScreenshotZoom({ screenshotUrl, onAnimationComplete }: ScreenshotZoomProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (screenshotUrl) {
            setIsVisible(true);
            // Determine center of screen
            // animation will handle the movement
        }
    }, [screenshotUrl]);

    return (
        <AnimatePresence onExitComplete={onAnimationComplete}>
            {isVisible && screenshotUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 1, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [1, 0.8, 0.2, 0],
                        // Move towards the center/modal position (simulated) or just shrink to center
                        transition: { duration: 1.2, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }
                    }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    onAnimationComplete={() => setIsVisible(false)}
                >
                    <div className="relative w-full h-full max-w-screen max-h-screen p-10 flex items-center justify-center">
                        <motion.img
                            src={screenshotUrl}
                            alt="Screenshot Capture"
                            className="rounded-lg shadow-2xl border-4 border-white dark:border-zinc-800 object-contain max-h-full max-w-full"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
