"use client";

import { clearSiteData } from "@/lib/cache-utils";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Segment Error:", error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-destructive/20 bg-background">
                <CardHeader className="flex flex-col items-center gap-2 text-center pb-2">
                    <div className="rounded-full bg-destructive/10 p-3 mb-2">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-xl font-bold">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                    <p className="text-muted-foreground text-sm">
                        We encountered an unexpected error. You can try to recover by refreshing the component,
                        or if the problem persists, perform a deep repair.
                    </p>
                    {error.message && (
                        <div className="mt-4 p-3 bg-muted rounded-md text-xs font-mono text-left overflow-auto max-h-32 border">
                            {error.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full gap-2"
                        variant="default"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                    <Button
                        onClick={() => clearSiteData()}
                        variant="outline"
                        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                        <Trash2 className="h-4 w-4" />
                        Deep Repair & Restart
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
