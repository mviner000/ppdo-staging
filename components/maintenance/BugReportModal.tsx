"use client";

import {
    ResizableModal,
    ResizableModalContent,
    ResizableModalHeader,
    ResizableModalTitle,
    ResizableModalDescription,
    ResizableModalBody,
} from "@/components/ui/resizable-modal";
import { BugReportForm } from "./BugReportForm";

interface BugReportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function BugReportModal({ open, onOpenChange, onSuccess }: BugReportModalProps) {
    return (
        <ResizableModal open={open} onOpenChange={onOpenChange}>
            <ResizableModalContent className="sm:max-w-[800px] sm:max-h-[80vh] flex flex-col" allowOverflow>
                <ResizableModalHeader>
                    <ResizableModalTitle>Report a Bug</ResizableModalTitle>
                    <ResizableModalDescription>
                        Describe the bug you encountered. You can upload images or videos.
                    </ResizableModalDescription>
                </ResizableModalHeader>
                <ResizableModalBody className="p-6">
                    <BugReportForm
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
