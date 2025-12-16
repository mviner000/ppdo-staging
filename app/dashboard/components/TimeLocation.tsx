// app/dashboard/components/TimeLocation.tsx

"use client";

import { useEffect, useState } from "react";

export function TimeLocation() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [location, setLocation] = useState<string>("Getting location...");

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding using Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address;

            // Build location string
            let locationString = "";
            if (address.city || address.town || address.municipality) {
              locationString =
                address.city || address.town || address.municipality;
            } else if (address.village) {
              locationString = address.village;
            }

            if (address.state || address.province) {
              locationString += locationString
                ? `, ${address.state || address.province}`
                : address.state || address.province;
            }

            if (address.country) {
              locationString += locationString
                ? `, ${address.country}`
                : address.country;
            }

            setLocation(locationString || "Location found");
          } else {
            setLocation("Tarlac, Philippines");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          setLocation("Tarlac, Philippines");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation("Tarlac, Philippines");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-4">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-zinc-500 dark:text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
          {currentTime}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-zinc-500 dark:text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {location}
        </span>
      </div>
    </div>
  );
}
