// components/ppdo/funds/hooks/useFundsMutations.ts

/**
 * Generic hook for fund CRUD mutations
 * Works with any fund type by accepting Convex API endpoints as parameters
 */

import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { UseFundsMutationsReturn } from "../types";

interface UseFundsMutationsOptions {
    /**
     * Convex mutation for creating a fund
     * Should have signature: (args: TCreateArgs) => Id
     */
    createMutation: FunctionReference<"mutation", "public", any, any>;

    /**
     * Convex mutation for updating a fund
     * Should have signature: (args: { id: Id, ...TUpdateArgs }) => void
     */
    updateMutation: FunctionReference<"mutation", "public", any, any>;

    /**
     * Convex mutation for moving to trash
     * Should have signature: (args: { id: Id, reason?: string }) => void
     */
    moveToTrashMutation: FunctionReference<"mutation", "public", any, any>;

    /**
     * Display name for toasts (e.g., "trust fund", "special education fund")
     */
    entityName?: string;
}

/**
 * Generic funds mutations  hook
 * 
 * @example
 * // For Trust Funds
 * const { handleAdd, handleEdit, handleDelete } = useFundsMutations({
 *   createMutation: api.trustFunds.create,
 *   updateMutation: api.trustFunds.update,
 *   moveToTrashMutation: api.trustFunds.moveToTrash,
 *   entityName: "trust fund"
 * });
 */
export function useFundsMutations(
    options: UseFundsMutationsOptions
): UseFundsMutationsReturn {
    const { createMutation, updateMutation, moveToTrashMutation, entityName = "fund" } = options;

    const create = useMutation(createMutation);
    const update = useMutation(updateMutation);
    const moveToTrash = useMutation(moveToTrashMutation);

    const handleAdd = async (data: any) => {
        try {
            const toastId = toast.loading(`Creating ${entityName}...`);

            const status = data.status || "not_yet_started";

            await create({
                ...data,
                status,
            });

            toast.dismiss(toastId);
            toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} created successfully`);
        } catch (error) {
            console.error(`Error creating ${entityName}:`, error);
            toast.error(error instanceof Error ? error.message : `Failed to create ${entityName}`);
            throw error;
        }
    };

    const handleEdit = async (id: string, data: any) => {
        try {
            const toastId = toast.loading(`Updating ${entityName}...`);

            const status = data.status || "not_yet_started";

            await update({
                id: id as any,
                ...data,
                status,
                reason: "User edit via form",
            });

            toast.dismiss(toastId);
            toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} updated successfully`);
        } catch (error) {
            console.error(`Error updating ${entityName}:`, error);
            toast.error(error instanceof Error ? error.message : `Failed to update ${entityName}`);
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const toastId = toast.loading("Moving to trash...");

            await moveToTrash({
                id: id as any,
                reason: "User deleted via UI",
            });

            toast.dismiss(toastId);
            toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} moved to trash`);
        } catch (error) {
            console.error(`Error deleting ${entityName}:`, error);
            toast.error(error instanceof Error ? error.message : "Failed to move to trash");
            throw error;
        }
    };

    return {
        handleAdd,
        handleEdit,
        handleDelete,
    };
}
