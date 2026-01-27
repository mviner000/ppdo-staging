"use client";

import NextTopLoader from "nextjs-toploader";
import { useAccentColor } from "@/contexts/AccentColorContext";

export function ProgressBar() {
    const { accentColorValue } = useAccentColor();

    return (
        <NextTopLoader
            color={accentColorValue}
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow={`0 0 10px ${accentColorValue}, 0 0 5px ${accentColorValue}`}
        />
    );
}
