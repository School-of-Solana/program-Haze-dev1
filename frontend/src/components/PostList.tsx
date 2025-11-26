"use client";

import { useState } from "react";
import { useFetchPosts } from "@/hooks/useFetchData";
import PostCard from "./PostCard";

export default function PostList() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { posts, loading } = useFetchPosts(refreshKey);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No posts yet. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recent Posts
        </h2>
        <button
          onClick={handleRefresh}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {posts.map((post) => (
        <PostCard key={`${post.author}-${post.postId}`} post={post} onUpdate={handleRefresh} />
      ))}
    </div>
  );
}
