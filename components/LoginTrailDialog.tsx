"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginTrail } from "./LoginTrail";
import { ShieldAlert } from "lucide-react";
import { useAccentColor } from "../contexts/AccentColorContext";

export function LoginTrailDialog() {
    const { accentColorValue } = useAccentColor();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm"
                >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden sm:inline">Security Logs</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">
                        Security Audit Trail
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <LoginTrail />
                </div>
            </DialogContent>
        </Dialog>
    );
}
