"use client";

import {
    ResizableModal,
    ResizableModalContent,
    ResizableModalHeader,
    ResizableModalTitle,
    ResizableModalDescription,
    ResizableModalBody,
} from "@/components/ui/resizable-modal";
import { SuggestionForm } from "./SuggestionForm";

interface SuggestionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function SuggestionModal({ open, onOpenChange, onSuccess }: SuggestionModalProps) {
    return (
        <ResizableModal open={open} onOpenChange={onOpenChange}>
            <ResizableModalContent className="sm:max-w-[800px] sm:max-h-[80vh] flex flex-col" allowOverflow>
                <ResizableModalHeader>
                    <ResizableModalTitle>Submit a Suggestion</ResizableModalTitle>
                    <ResizableModalDescription>
                        Share your ideas. You can include images or videos to illustrate your suggestion.
                    </ResizableModalDescription>
                </ResizableModalHeader>
                <ResizableModalBody className="p-6">
                    <SuggestionForm
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                            onOpenChange(false);
                        }}
                        onCancel={() => onOpenChange(false)}
                    />
                </ResizableModalBody>
            </ResizableModalContent>
        </ResizableModal>
    );
}
