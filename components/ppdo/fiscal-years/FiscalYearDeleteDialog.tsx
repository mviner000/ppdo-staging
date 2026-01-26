import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";

interface FiscalYearDeleteDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    yearToDelete: { id: Id<"fiscalYears">; year: number } | null;
    onConfirm: () => void;
    itemTypeLabel?: string; // e.g. "budget items, projects, or breakdowns" or "trust funds"
}

export function FiscalYearDeleteDialog({
    isOpen,
    setIsOpen,
    yearToDelete,
    onConfirm,
    itemTypeLabel = "items",
}: FiscalYearDeleteDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Fiscal Year {yearToDelete?.year}?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>Are you sure you want to delete this fiscal year?</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            <strong>Note:</strong> Deleting this fiscal year will not affect or delete the {itemTypeLabel} associated with year {yearToDelete?.year}. You can recreate the same fiscal year later to view these items again.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
