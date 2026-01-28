"use client";

import {
    ResizableModal,
    ResizableModalContent,
    ResizableModalHeader,
    ResizableModalTitle,
    ResizableModalDescription,
    ResizableModalBody,
    ResizableModalFooter,
} from "@/components/ui/resizable-modal";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/shared/utils/form-helpers";
import { Calculator } from "lucide-react";

interface AutoCalcConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        obligated: number;
        utilized: number;
        balance: number;
    };
}

export function AutoCalcConfirmationModal({
    isOpen,
    onClose,
    data,
}: AutoCalcConfirmationModalProps) {
    return (
        <ResizableModal open={isOpen} onOpenChange={onClose}>
            <ResizableModalContent maxWidth="600px">
                <ResizableModalHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Calculator className="w-5 h-5 text-green-700 dark:text-green-400" />
                        </div>
                        <ResizableModalTitle>Auto-Calculation Updated</ResizableModalTitle>
                    </div>
                    <ResizableModalDescription>
                        The fund's financial metrics have been automatically recalculated based on the breakdown items.
                    </ResizableModalDescription>
                </ResizableModalHeader>
                <ResizableModalBody className="px-6 py-4">
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow>
                                    <TableHead className="text-center">Obligated</TableHead>
                                    <TableHead className="text-center">Utilized</TableHead>
                                    <TableHead className="text-center">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-center font-semibold">
                                        {formatCurrency(data.obligated)}
                                    </TableCell>
                                    <TableCell className="text-center font-semibold">
                                        {formatCurrency(data.utilized)}
                                    </TableCell>
                                    <TableCell className="text-center font-semibold">
                                        {formatCurrency(data.balance)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </ResizableModalBody>
                <ResizableModalFooter>
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        Acknowledge
                    </Button>
                </ResizableModalFooter>
            </ResizableModalContent>
        </ResizableModal>
    );
}
