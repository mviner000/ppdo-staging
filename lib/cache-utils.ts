/**
 * Clears all client-side data including localStorage, sessionStorage, and caches.
 * Then forces a hard reload to the root path.
 */
export async function clearSiteData() {
    try {
        // Clear Local Storage
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.clear();
        }

        // Clear Session Storage
        if (typeof window !== "undefined" && window.sessionStorage) {
            window.sessionStorage.clear();
        }

        // Clear Cache Storage API (Service Workers, etc.)
        if (typeof window !== "undefined" && "caches" in window) {
            const keys = await window.caches.keys();
            await Promise.all(keys.map((key) => window.caches.delete(key)));
        }

        // Unregister Service Workers
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        console.log("Site data cleared successfully.");
    } catch (error) {
        console.error("Error clearing site data:", error);
    } finally {
        // Force hard reload to root
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
    }
}
