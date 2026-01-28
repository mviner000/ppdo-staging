"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Loader2, Sparkles } from "lucide-react";

interface SuggestionFormProps {
    onSuccess?: (suggestionId: string) => void;
    onCancel?: () => void;
    initialTitle?: string;
    initialDescription?: string;
    initialMultimedia?: Array<{ storageId: string, type: "image" | "video", name: string }>;
    screenshot?: string | null; // For handling screenshot processing
}

export function SuggestionForm({
    onSuccess,
    onCancel,
    initialTitle = "",
    initialDescription = "",
    initialMultimedia = [],
    screenshot
}: SuggestionFormProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [multimedia, setMultimedia] = useState<Array<{ storageId: string, type: "image" | "video", name: string }>>(initialMultimedia);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);

    const createSuggestion = useMutation(api.suggestions.create);
    const generateUploadUrl = useMutation(api.media.generateUploadUrl);

    // Screenshot processing logic
    useEffect(() => {
        const handleScreenshotAutofill = async () => {
            if (screenshot && (description === "" || description === "<p></p>")) {
                try {
                    setIsProcessingScreenshot(true);

                    // Show large loading indicator inside the editor
                    setDescription(`
                        <div class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 my-4">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Attaching Screenshot...</h3>
                            <p class="text-sm text-zinc-500 dark:text-zinc-400">Please wait while we process the image.</p>
                        </div>
                    `);

                    const res = await fetch(screenshot);
                    const blob = await res.blob();
                    const file = new File([blob], "screenshot.png", { type: "image/png" });

                    const postUrl = await generateUploadUrl();
                    const result = await fetch(postUrl, {
                        method: "POST",
                        headers: { "Content-Type": file.type },
                        body: file,
                    });

                    if (result.ok) {
                        const { storageId } = await result.json();
                        const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(".cloud", ".site");
                        const imageUrl = `${convexSiteUrl}/images/${storageId}`;

                        const imgHtml = `<p><strong>Captured Screenshot:</strong></p><img src="${imageUrl}" class="rounded-md border border-zinc-200 dark:border-zinc-700 my-2" />`;
                        setDescription(imgHtml);

                        setMultimedia(prev => [...prev, {
                            storageId,
                            type: "image",
                            name: "screenshot.png"
                        }]);
                    }
                } catch (error) {
                    console.error("Failed to auto-upload screenshot", error);
                    toast.error("Failed to upload screenshot");
                    setDescription(""); // Clear loading state
                } finally {
                    setIsProcessingScreenshot(false);
                }
            }
        };

        if (screenshot) {
            handleScreenshotAutofill();
        }
    }, [screenshot, generateUploadUrl]);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Validation Error", {
                description: "Please fill in all required fields",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createSuggestion({
                title,
                description,
                multimedia: multimedia.map(m => ({
                    storageId: m.storageId as any,
                    type: m.type,
                    name: m.name
                }))
            });

            toast.success("Suggestion Submitted", {
                description: "Your suggestion has been successfully submitted",
            });

            // Reset form
            setTitle("");
            setDescription("");
            setMultimedia([]);

            if (onSuccess) {
                onSuccess(result.suggestionId);
            }
        } catch (error) {
            console.error("❌ Error creating suggestion:", error);
            toast.error("Error", {
                description: "Failed to submit suggestion. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                    id="title"
                    placeholder="Brief summary of your suggestion"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                    autoFocus
                />
            </div>

            <div className="space-y-2">
                <Label>Description *</Label>
                <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe your suggestion..."
                    onMultimediaChange={(newMedia) => {
                        setMultimedia(prev => [...prev, ...newMedia]);
                    }}
                    className="min-h-[300px]"
                    disabled={isProcessingScreenshot}
                />
                {!isProcessingScreenshot && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {screenshot
                            ? "A screenshot of your current page has been automatically attached."
                            : "You can paste images directly or upload videos using the toolbar."}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#15803D] hover:bg-[#15803D]/90 text-white gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Submit Suggestion
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
