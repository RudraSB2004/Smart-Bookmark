"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddBookmark({ user }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const addBookmark = async () => {
    if (!title || !url) return alert("Fill all fields");
    if (!user?.id) return alert("User not logged in"); // Safety check

    setLoading(true);

    // 1. We must destructure 'error' to see if the insert failed
    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title,
          url,
          user_id: user.id,
        },
      ])
      .select(); // Best practice: Return the inserted row

    setLoading(false);

    // 2. Handle the error explicitly
    if (error) {
      console.error("Error adding bookmark:", error.message);
      alert(`Error: ${error.message}`);
      return;
    }

    // 3. Only clear inputs if successful
    console.log("Bookmark added successfully:", data);
    setTitle("");
    setUrl("");
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow space-y-3">
      <h2 className="text-lg font-semibold">Add Bookmark</h2>

      <input
        placeholder="Website title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      <input
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      <button
        onClick={addBookmark}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80"
      >
        {loading ? "Adding..." : "Add Bookmark"}
      </button>
    </div>
  );
}
