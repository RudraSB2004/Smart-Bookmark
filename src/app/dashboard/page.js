"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AddBookmark from "../components/AddBookmark";
import BookmarkList from "../components/BookmarkList";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
          <p className="text-gray-400 text-sm font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Manage your saved links and resources.
          </p>
        </div>

        <div className="space-y-6">
          <AddBookmark user={user} />
          <BookmarkList user={user} />
        </div>
      </div>
    </main>
  );
}
