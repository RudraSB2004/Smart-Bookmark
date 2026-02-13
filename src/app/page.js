"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // 1. Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // If logged in, go straight to dashboard
        router.replace("/dashboard");
      } else {
        // If not, show the landing page
        setIsChecking(false);
      }
    };
    checkUser();
  }, [router]);

  // 2. Handle Google Login
  const handleLogin = async () => {
    // Get the base URL of your site (e.g., http://localhost:3000)
    const origin = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // FIX: Redirect directly to dashboard to avoid 404 on missing callback routes
        redirectTo: `${origin}/dashboard`,
      },
    });
  };

  // 3. Loading State (Spinner)
  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </main>
    );
  }

  // 4. Modern Landing Page UI
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Animated Logo */}
        <div className="mx-auto w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-6 transition-transform duration-300">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>

        {/* Hero Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Smart Bookmarks
          </h1>
          <p className="text-lg text-gray-500 max-w-sm mx-auto">
            The minimalist way to save, organize, and sync your favorite links
            in real-time.
          </p>
        </div>

        {/* Features / Icons */}
        <div className="flex justify-center gap-6 text-sm font-medium text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Realtime Sync
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Secure
          </span>
        </div>

        {/* Login Button */}
        <div className="pt-6">
          <button
            onClick={handleLogin}
            className="w-full group relative flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-white group-hover:text-gray-200"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
            </span>
            Continue with Google
          </button>
          <p className="mt-6 text-xs text-center text-gray-400">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </main>
  );
}
