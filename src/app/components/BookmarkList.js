"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BookmarkList({ user }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("CONNECTING");

  // useRef prevents the channel from being recreated on every render
  const channelRef = useRef(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    else setBookmarks(data || []);
    setLoading(false);
  }, [user?.id]);

  const removeBookmark = async (id) => {
    setBookmarks((current) => current.filter((b) => b.id !== id));
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  useEffect(() => {
    if (!user?.id) return;

    // 1. Fetch initial data
    fetchBookmarks();

    // 2. Define the channel setup
    const setupRealtime = () => {
      // If a channel already exists, clean it up first
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`room-user-${user.id}`) // Unique channel name
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            fetchBookmarks();
          },
        )
        .subscribe((state) => {
          // Update UI status based on connection state
          if (state === "SUBSCRIBED") setStatus("CONNECTED");
          else if (state === "CLOSED") setStatus("OFFLINE");
          else if (state === "CHANNEL_ERROR") setStatus("ERROR");
          else setStatus("CONNECTING");
        });

      channelRef.current = channel;
    };

    setupRealtime();

    // 3. Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, fetchBookmarks]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex justify-end px-1">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 
            ${
              status === "CONNECTED"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === "CONNECTED"
                ? "bg-green-500 animate-pulse"
                : "bg-gray-400"
            }`}
          ></span>
          {status === "CONNECTED" ? "Live Synced" : status}
        </span>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <h3 className="text-gray-900 font-medium">No bookmarks yet</h3>
        </div>
      ) : (
        bookmarks.map((b) => (
          <div
            key={b.id}
            className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-center"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  ></path>
                </svg>
              </div>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium text-gray-900 hover:text-blue-600"
              >
                {b.title}
              </a>
            </div>
            <button
              onClick={() => removeBookmark(b.id)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        ))
      )}
    </div>
  );
}
