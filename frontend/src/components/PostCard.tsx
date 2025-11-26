"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Post } from "@/types/blog";
import { useBlog } from "@/hooks/useBlog";
import { useFetchProfile } from "@/hooks/useFetchData";

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { publicKey } = useWallet();
  const { deletePost } = useBlog();
  const { profile } = useFetchProfile(post.author);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const isAuthor = publicKey?.toString() === post.author;
  const displayName = profile?.displayName || `${post.author.slice(0, 4)}...${post.author.slice(-4)}`;
  
  const formattedDate = new Date(post.createdAt * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(post.postId);
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const contentPreview = post.content.length > 300 
    ? post.content.slice(0, 300) + "..." 
    : post.content;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{displayName}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      <div className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
        {showFullContent ? post.content : contentPreview}
      </div>

      {post.content.length > 300 && (
        <button
          onClick={() => setShowFullContent(!showFullContent)}
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
        >
          {showFullContent ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
        </span>
      </div>
    </div>
  );
}
