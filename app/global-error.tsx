"use client";

import { clearSiteData } from "@/lib/cache-utils";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans">
                <div className="max-w-md p-8 bg-white shadow-lg rounded-xl border border-gray-200 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-red-100 p-3">
                            <svg
                                className="h-8 w-8 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                        Critical System Error
                    </h2>
                    <p className="text-gray-500 mb-6">
                        A critical error has occurred. Please try refreshing the page. If the
                        issue persists, perform a deep repair to clear all local data.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => reset()}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => clearSiteData()}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Deep Repair & Restart
                        </button>
                    </div>
                    {error.digest && (
                        <p className="mt-6 text-xs text-gray-400">
                            Error Digest: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
