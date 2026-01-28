"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useEffect } from "react";
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Quote, Image as ImageIcon, Link as LinkIcon,
    Undo, Redo, Terminal, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

import { Node, mergeAttributes } from "@tiptap/core";
import { Video as VideoIcon } from "lucide-react";

// Define Video Extension
const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'rounded-md max-w-full my-2' })]
    },

    addCommands() {
        return {
            setVideo: (options: { src: string }) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                })
            },
        }
    },
});

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        video: {
            setVideo: (options: { src: string }) => ReturnType,
        }
    }
}

// Setup syntax highlighting
const lowlight = createLowlight(all);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onMultimediaChange?: (media: Array<{ storageId: string, type: "image" | "video", name: string }>) => void;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Write something...",
    className = "",
    disabled = false,
    onMultimediaChange,
    variant = "default"
}: RichTextEditorProps & { variant?: "default" | "ordered-list" }) {
    const generateUploadUrl = useMutation(api.media.generateUploadUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [mode, setMode] = useState<"write" | "preview">("write");

    // Determine the HTTP Action URL
    // If NEXT_PUBLIC_CONVEX_URL is https://example.convex.cloud, the site is https://example.convex.site
    const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(".cloud", ".site");

    const handleMediaUpload = useCallback(async (file: File): Promise<{ url: string, storageId: string, type: "image" | "video", name: string } | null> => {
        try {
            setIsUploading(true);

            // 1. Determine type and Compress if Image
            const isImage = file.type.startsWith("image");
            const isVideo = file.type.startsWith("video");

            if (!isImage && !isVideo) {
                toast.error("Only images and videos are supported");
                return null;
            }

            let fileToUpload = file;
            if (isImage) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true
                };
                try {
                    fileToUpload = await imageCompression(file, options);
                } catch (e) {
                    console.warn("Compression failed, using original file", e);
                }
            }

            // 2. Get Upload URL
            const postUrl = await generateUploadUrl();

            // 3. Upload to Convex Storage
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": fileToUpload.type },
                body: fileToUpload,
            });

            if (!result.ok) throw new Error("Upload failed");
            const { storageId } = await result.json();

            // 4. Return Data
            return {
                url: `${convexSiteUrl}/images/${storageId}`,
                storageId,
                type: isImage ? "image" : "video",
                name: file.name
            };

        } catch (error) {
            console.error("Media upload error:", error);
            toast.error("Failed to upload media.");
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [convexSiteUrl, generateUploadUrl]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use lowlight
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            ImageExtension.configure({
                inline: true,
                allowBase64: true,
            }),
            VideoExtension, // Add Video Extension
            Placeholder.configure({
                placeholder: variant === "ordered-list" ? "1. Step one..." : placeholder,
            }),
            LinkExtension.configure({
                openOnClick: false,
                autolink: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            if (variant === "ordered-list" && editor.isEmpty) {
                editor.commands.toggleOrderedList();
            }
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-3 py-2 prose-p:my-0 prose-headings:my-1 prose-ul:my-0 prose-ol:my-0 ${variant === "ordered-list" ? "data-[placeholder]:before:!content-none" : ""}`,
            },
            handlePaste: (view, event, slice) => {
                if (variant === "ordered-list") return false; // Default paste for ordered list to avoid breaking list

                const items = Array.from(event.clipboardData?.items || []);
                const images = items.filter(item => item.type.startsWith("image"));

                if (images.length === 0) return false;

                event.preventDefault(); // Prevent default paste behavior for images

                images.forEach(async (item) => {
                    const file = item.getAsFile();
                    if (!file) return;

                    const mediaData = await handleMediaUpload(file);
                    if (mediaData && editor) {
                        if (mediaData.type === "image") {
                            editor.chain().focus().setImage({ src: mediaData.url }).run();
                        } else {
                            // Video support using extension
                            editor.chain().focus().setVideo({ src: mediaData.url }).run();
                        }

                        if (onMultimediaChange) {
                            onMultimediaChange([{
                                storageId: mediaData.storageId,
                                type: mediaData.type,
                                name: mediaData.name
                            }]);
                        }
                    }
                });

                return true;
            },
        },
        immediatelyRender: false,
    });

    // Sync editor content when value prop changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const triggerMediaUpload = (type: 'image' | 'video') => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = type === 'image' ? "image/*" : "video/*";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const mediaData = await handleMediaUpload(file);
                if (mediaData && editor) {
                    if (mediaData.type === "image") {
                        editor.chain().focus().setImage({ src: mediaData.url }).run();
                    } else {
                        // Video support
                        editor.chain().focus().setVideo({ src: mediaData.url }).run();
                        // Also insert a paragraph after to allow typing
                        editor.chain().focus().enter().run();
                    }

                    if (onMultimediaChange) {
                        onMultimediaChange([{
                            storageId: mediaData.storageId,
                            type: mediaData.type,
                            name: mediaData.name
                        }]);
                    }
                }
            }
        };
        input.click();
    };

    if (!editor) {
        return null;
    }

    return (
        <div className={`border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 flex flex-col ${className}`}>

            {/* Toolbar - Hide if variant is ordered-list */}
            {variant !== "ordered-list" && (
                <div className="flex items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex-wrap">

                    {/* Toggle Mode */}
                    <div className="flex mr-2 bg-zinc-200 dark:bg-zinc-800 rounded-md p-0.5">
                        <button
                            onClick={() => setMode("write")}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${mode === "write"
                                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                }`}
                        >
                            Write
                        </button>
                        <button
                            onClick={() => setMode("preview")}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${mode === "preview"
                                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                }`}
                        >
                            Preview
                        </button>
                    </div>

                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-2" />

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run() || mode === "preview"}
                        className={editor.isActive("bold") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        title="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run() || mode === "preview"}
                        className={editor.isActive("italic") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        title="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().chain().focus().toggleStrike().run() || mode === "preview"}
                        className={editor.isActive("strike") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={!editor.can().chain().focus().toggleCode().run() || mode === "preview"}
                        className={editor.isActive("code") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        title="Inline Code"
                    >
                        <Code className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-2" />

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive("bulletList") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        disabled={mode === "preview"}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive("orderedList") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        disabled={mode === "preview"}
                        title="Ordered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive("blockquote") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        disabled={mode === "preview"}
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editor.isActive("codeBlock") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        disabled={mode === "preview"}
                        title="Code Block"
                    >
                        <Terminal className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-2" />

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={setLink}
                        className={editor.isActive("link") ? "bg-zinc-200 dark:bg-zinc-800" : ""}
                        disabled={mode === "preview"}
                        title="Link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>



                    <div className="ml-auto flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo() || mode === "preview"}
                            title="Undo"
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo() || mode === "preview"}
                            title="Redo"
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Editor Content */}
            <div className={`relative ${mode === "preview" ? "hidden" : "block"}`}>
                <EditorContent editor={editor} />
                {isUploading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Optimizing & Uploading...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with Actions  - Hide if variant is ordered-list */}
            {variant !== "ordered-list" && (
                <div className="flex items-center gap-2 p-1.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 gap-2"
                        onClick={() => triggerMediaUpload('image')}
                        disabled={isUploading || mode === "preview"}
                    >
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">Add Image</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 gap-2"
                        onClick={() => triggerMediaUpload('video')}
                        disabled={isUploading || mode === "preview"}
                    >
                        <VideoIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">Add Video</span>
                    </Button>

                    {isUploading && (
                        <span className="text-xs text-blue-500 animate-pulse ml-auto">
                            Uploading media...
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
