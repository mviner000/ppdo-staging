// app/signin/page.tsx

"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Eye, EyeOff, AlertCircle, Quote } from "lucide-react";

interface LocationData {
  city: string;
  region: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Error type classification for better UX
type ErrorType = 'invalid_credentials' | 'account_locked' | 'account_suspended' | 'account_inactive' | 'network_error' | 'unknown';

interface UserFriendlyError {
  type: ErrorType;
  title: string;
  message: string;
  action?: string;
}

// Centralized error mapping for consistent UX
const parseAuthError = (error: any): UserFriendlyError => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorData = error?.data || {};

  // Wrong password - Convex throws "InvalidSecret" when password is incorrect
  if (
    errorMessage.includes('invalidsecret') ||
    errorMessage.includes('invalid secret')
  ) {
    return {
      type: 'invalid_credentials',
      title: 'Incorrect Password',
      message: 'The password you entered is wrong.',
      action: 'Try again or click "Forgot password?" below.'
    };
  }

  // Account not found - Convex throws "InvalidAccountId" when email doesn't exist
  if (
    errorMessage.includes('invalidaccountid') ||
    errorMessage.includes('invalid account')
  ) {
    return {
      type: 'invalid_credentials',
      title: 'Account Not Found',
      message: 'No account exists with this email address.',
      action: 'Check your email or contact support.'
    };
  }

  // Generic invalid credentials fallback
  if (
    errorMessage.includes('invalid credentials') ||
    errorMessage.includes('account not found') ||
    errorMessage.includes('incorrect password') ||
    errorMessage.includes('invalid password') ||
    errorMessage.includes('wrong password')
  ) {
    return {
      type: 'invalid_credentials',
      title: 'Sign In Failed',
      message: 'Your email or password is incorrect.',
      action: 'Try again or click "Forgot password?" below.'
    };
  }

  // Account locked
  if (
    errorMessage.includes('locked') ||
    errorMessage.includes('account is locked') ||
    errorData.isLocked
  ) {
    return {
      type: 'account_locked',
      title: 'Account Locked',
      message: 'Your account is locked for security.',
      action: 'Contact support to unlock it.'
    };
  }

  // Account suspended
  if (
    errorMessage.includes('suspended') ||
    errorMessage.includes('account suspended') ||
    errorData.status === 'suspended'
  ) {
    return {
      type: 'account_suspended',
      title: 'Account Suspended',
      message: 'Your account has been suspended.',
      action: 'Contact support for help.'
    };
  }

  // Account inactive
  if (
    errorMessage.includes('inactive') ||
    errorMessage.includes('account inactive') ||
    errorMessage.includes('account is inactive') ||
    errorData.status === 'inactive'
  ) {
    return {
      type: 'account_inactive',
      title: 'Account Inactive',
      message: 'Your account is not active.',
      action: 'Contact support to activate it.'
    };
  }

  // Network or connection errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    error?.name === 'NetworkError' ||
    error?.name === 'TypeError'
  ) {
    return {
      type: 'network_error',
      title: 'Connection Error',
      message: 'Cannot connect to the server.',
      action: 'Check your internet and try again.'
    };
  }

  // Password requirements error (shouldn't happen on sign in, but just in case)
  if (errorMessage.includes('invalid password') && errorMessage.includes('8 characters')) {
    return {
      type: 'invalid_credentials',
      title: 'Invalid Password',
      message: 'Password must be at least 8 characters.',
      action: 'Enter a longer password.'
    };
  }

  // Missing required fields
  if (
    errorMessage.includes('missing') ||
    errorMessage.includes('required')
  ) {
    return {
      type: 'invalid_credentials',
      title: 'Missing Information',
      message: 'Please enter both email and password.',
      action: 'Fill in all fields and try again.'
    };
  }

  // Generic fallback
  return {
    type: 'unknown',
    title: 'Sign In Error',
    message: 'Something went wrong, please try again.',
    action: 'Contact support if this keeps happening.'
  };
};

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<UserFriendlyError | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientIP, setClientIP] = useState<string>("Unknown");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Mutations for login trail tracking
  const recordSuccessfulLogin = useMutation(api.auth.recordSuccessfulLogin);
  const recordFailedLogin = useMutation(api.auth.recordFailedLogin);

  // Query to get current user after successful login
  const currentUser = useQuery(api.auth.getCurrentUser);

  // Fetch location data on mount
  useEffect(() => {
    async function fetchLocationData() {
      setLocationLoading(true);

      // First, try to get IP address
      let ipAddress = "Unknown";
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(3000),
        });
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip || 'Unknown';
          setClientIP(ipAddress);
        }
      } catch (error) {
        // Try fallback
        try {
          const ipResponse = await fetch('https://api.my-ip.io/ip', {
            signal: AbortSignal.timeout(3000),
          });
          if (ipResponse.ok) {
            const ip = await ipResponse.text();
            ipAddress = ip.trim() || 'Unknown';
            setClientIP(ipAddress);
          }
        } catch (error) {
          setClientIP('Unknown');
        }
      }

      // Try browser geolocation first
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Got coordinates, now reverse geocode
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
              // Use a reverse geocoding service
              const geocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                  headers: {
                    'User-Agent': 'YourAppName/1.0',
                  },
                  signal: AbortSignal.timeout(5000),
                }
              );

              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                const address = geocodeData.address || {};

                setLocationData({
                  city: address.city || address.town || address.village || address.municipality || 'Unknown',
                  region: address.state || address.province || address.region || 'Unknown',
                  country: address.country || 'Unknown',
                  coordinates: { lat, lng }
                });
                setLocationLoading(false);
                return;
              }
            } catch (error) {
              console.log('Reverse geocoding failed, falling back to IP location');
            }

            // If reverse geocoding fails, fall back to IP-based location
            await fetchIPBasedLocation(ipAddress);
          },
          async (error) => {
            // Geolocation denied or failed, use IP-based location
            console.log('Geolocation denied or failed, using IP-based location');
            await fetchIPBasedLocation(ipAddress);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000, // Cache for 5 minutes
          }
        );
      } else {
        // Browser doesn't support geolocation
        await fetchIPBasedLocation(ipAddress);
      }
    }

    async function fetchIPBasedLocation(ipAddress: string) {
      try {
        // Use IP-based geolocation service
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const data = await response.json();
          setLocationData({
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country_name || 'Unknown',
            coordinates: data.latitude && data.longitude ? {
              lat: data.latitude,
              lng: data.longitude
            } : undefined
          });
        } else {
          // Final fallback
          setLocationData({
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown'
          });
        }
      } catch (error) {
        // Final fallback
        setLocationData({
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown'
        });
      }

      setLocationLoading(false);
    }

    fetchLocationData();
  }, []);

  // Handle role-based redirect after successful login
  useEffect(() => {
    if (currentUser && !loading) {
      // Redirect based on role
      if (currentUser.role === "inspector") {
        router.push("/inspector");
      } else {
        router.push("/dashboard");
      }
    }
  }, [currentUser, loading, router]);

  // Helper function to get user agent
  const getUserAgent = () => {
    if (typeof window !== "undefined") {
      return window.navigator.userAgent;
    }
    return undefined;
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/b1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/60 to-black/50"></div>

      {/* Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden relative z-20">
        {/* Left Column - Premium Brand Panel */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-zinc-900 group">
          {/* Background Image with subtle zoom effect */}
          <div
            className="absolute inset-0 z-0 transition-transform duration-10000 ease-out group-hover:scale-110"
            style={{
              backgroundImage: `url('/Capitol.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Multi-layered Gradient Overlays */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-emerald-950/40 via-transparent to-transparent" />

          {/* Animated Decorative Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl animate-float-medium" />

          {/* Content Container */}
          <div className="relative z-20 flex flex-col w-full h-full p-10 lg:p-12">
            {/* Branding Section */}
            <div className="flex flex-col space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-4 p-4 rounded-2xl w-fit">
                <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain drop-shadow-lg" />
                <img src="/y.png" alt="Y Logo" className="h-14 w-auto object-contain drop-shadow-lg" />
              </div>

              <div className="space-y-1">
                <p className="text-zinc-400 text-xs font-semibold tracking-[0.3em] uppercase">
                  Republic of the Philippines
                </p>
                <h3 className="text-white text-xl font-bold tracking-tight">
                  PROVINCE OF TARLAC
                </h3>
              </div>
            </div>

            {/* Hero Text */}
            <div className="mt-auto mb-10 space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                Bawat Oras, <br />
                <span className="text-emerald-400">Damayan.</span>
              </h2>
              <p className="text-zinc-300 text-lg max-w-sm font-medium leading-relaxed">
                Digitizing Tarlac to build a more responsive and unified future for every Tarlaqueño.
              </p>
            </div>

            {/* Glassmorphic Quote Card */}
            <div
              className="mt-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: '400ms' }}
            >
              <Quote className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
              <blockquote className="relative z-10 text-xl font-medium text-white italic leading-relaxed">
                "Building a better tomorrow for Tarlac, one system at a time."
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-[2px] bg-emerald-500 rounded-full" />
                <div>
                  <p className="text-white font-bold leading-none">Gov. Christian Yap</p>
                  <p className="text-zinc-400 text-xs mt-1">Provincial Governor</p>
                </div>
              </div>
            </div>

            {/* Subtle Floating Elements (maintained but refined) */}
            <div className="absolute top-1/4 right-12 w-8 h-8 opacity-20 animate-float-slow">
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute bottom-1/3 left-8 w-6 h-6 opacity-10 animate-float-medium-delayed">
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm relative">
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md">
            {/* Logo/Title */}
            <div className="text-center md:text-left mb-8 md:mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Sign In
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Enter your credentials to continue
              </p>
            </div>

            {/* Modern Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 border border-red-200/60 dark:border-red-800/40 shadow-sm backdrop-blur-sm"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                      {error.title}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300/90 leading-relaxed">
                      {error.message}
                    </p>
                    {error.action && (
                      <p className="text-xs text-red-600 dark:text-red-400/80 mt-2 leading-relaxed">
                        {error.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;
                const ipAddress = clientIP;
                const userAgent = getUserAgent();

                // Client-side validation
                if (!email || !password) {
                  setError({
                    type: 'invalid_credentials',
                    title: 'Missing Information',
                    message: 'Please provide both email and password to sign in.',
                    action: 'Fill in all required fields and try again.'
                  });
                  setLoading(false);
                  return;
                }

                // Prepare location string
                let locationString = "Unknown";
                if (locationData) {
                  locationString = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
                }

                try {
                  // Sign in with Convex Auth
                  formData.set("flow", "signIn");

                  await signIn("password", formData);

                  // Record successful login attempt IMMEDIATELY before redirecting
                  try {
                    await recordSuccessfulLogin({
                      email: email,
                      ipAddress: ipAddress,
                      userAgent: userAgent,
                      location: locationString,
                      geoLocation: locationData ? JSON.stringify({
                        city: locationData.city,
                        region: locationData.region,
                        country: locationData.country,
                        coordinates: locationData.coordinates
                      }) : undefined
                    });
                  } catch (trackingError) {
                    // Continue to dashboard anyway, don't block user entry for logging failure
                    console.error('Failed to record successful login:', trackingError);
                  }

                  // Role-based redirect will be handled by useEffect watching currentUser
                  // No need to manually redirect here
                } catch (error: any) {
                  console.error('Sign in error:', error);

                  // Parse error into user-friendly format
                  const friendlyError = parseAuthError(error);

                  // Determine failure reason for logging
                  let failureReasonForLog = error.message || "Authentication Failed";

                  // Record failed login attempt
                  try {
                    await recordFailedLogin({
                      email,
                      ipAddress,
                      userAgent,
                      failureReason: failureReasonForLog,
                      location: locationString,
                      geoLocation: locationData ? JSON.stringify({
                        city: locationData.city,
                        region: locationData.region,
                        country: locationData.country,
                        coordinates: locationData.coordinates
                      }) : undefined
                    });
                  } catch (trackingError) {
                    // Don't block error display if tracking fails
                    console.error('Failed to record failed login:', trackingError);
                  }

                  // Display user-friendly error
                  setError(friendlyError);
                  setLoading(false);
                }
              }}
              className="space-y-6"
            >
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#15803d] focus:border-[#15803d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    minLength={8}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#15803d] focus:border-[#15803d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || locationLoading}
                className="cursor-pointer w-full py-3 rounded-xl bg-[#15803d] hover:bg-[#16a34a] text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? "Authenticating..." : locationLoading ? "Detecting location..." : "Sign In"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Don't have an account?{" "}
                <span className="text-zinc-400 dark:text-zinc-500">
                  Please contact your admin
                </span>
                <Link className="hidden" href="/signup">
                  <span className="text-zinc-400 dark:text-zinc-500">
                    temporary signup here
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}