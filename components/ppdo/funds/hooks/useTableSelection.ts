// components/ppdo/funds/hooks/useTableSelection.ts

import { useState } from "react";
import { BaseFund } from "../types";

export const useTableSelection = <T extends BaseFund>(data: T[]) => {
    const [selected, setSelected] = useState<string[]>([]);

    const allSelected = selected.length === data.length && data.length > 0;

    const toggleAll = () =>
        setSelected(allSelected ? [] : data.map((item) => item.id));

    const toggleOne = (id: string) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const clearSelection = () => setSelected([]);

    return { selected, allSelected, toggleAll, toggleOne, clearSelection };
};
