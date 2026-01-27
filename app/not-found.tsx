"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl w-full"
            >
                {/* Illustration Container */}
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative w-full aspect-square max-w-md mx-auto mb-8 drop-shadow-2xl"
                >
                    <Image
                        src="/images/404-illustration.png"
                        alt="Tarlac Capitol 404 Illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>

                {/* Text Content */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-6xl font-bold text-zinc-900 dark:text-white mb-4 font-cinzel"
                >
                    404
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto"
                >
                    Oops! It seems you&apos;ve wandered into a restricted area of the Capitol. This page doesn&apos;t exist.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-8 py-3 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#15803D]/20 group"
                    >
                        <Home size={18} className="transition-transform group-hover:-translate-y-0.5" />
                        Back to Dashboard
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </motion.div>

                {/* Breadcrumb footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-zinc-400 dark:text-zinc-600 text-sm flex items-center justify-center gap-2"
                >
                    <span>Tarlac Provincial Government</span>
                    <span>•</span>
                    <span>PPDO Digital System</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
