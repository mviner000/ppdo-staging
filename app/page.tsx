// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (isLoading) return; // wait until auth state is known

    if (!isAuthenticated) {
      router.replace("/signin");
    } else {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
