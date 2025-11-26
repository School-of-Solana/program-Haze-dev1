"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFetchProfile, useFetchBlog } from "@/hooks/useFetchData";
import { useBlog } from "@/hooks/useBlog";
import toast from "react-hot-toast";

export default function ProfileView() {
  const { publicKey } = useWallet();
  const { initializeProfile, initializeBlog } = useBlog();
  const { profile, loading: profileLoading } = useFetchProfile(publicKey?.toString());
  const { blog, loading: blogLoading } = useFetchBlog(publicKey?.toString());
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        // Profile cannot be updated once created
        toast.error("Profile cannot be updated once created");
        setIsEditing(false);
      } else {
        await initializeProfile(displayName, bio, avatarUrl);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeBlog = async () => {
    setSaving(true);
    try {
      await initializeBlog();
    } catch (error) {
      console.error("Error initializing blog:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Please connect your wallet to view your profile
        </p>
      </div>
    );
  }

  if (profileLoading || blogLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Profile
          </h2>
          
          {/* Profile editing disabled - profiles cannot be updated once created */}
        </div>

        {!profile && !isEditing ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven't created a profile yet
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Profile
            </button>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/avatar.png"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setDisplayName(profile.displayName);
                    setBio(profile.bio);
                    setAvatarUrl(profile.avatarUrl);
                  }
                }}
                disabled={saving}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {profile?.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.displayName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h4>
              <p className="text-gray-600 dark:text-gray-400">{profile?.bio}</p>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Joined: {profile && new Date(profile.joinedAt * 1000).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Blog Stats
        </h2>
        
        {!blog ? (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven't initialized your blog yet
            </p>
            <button
              onClick={handleInitializeBlog}
              disabled={saving}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? "Initializing..." : "Initialize Blog"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Posts</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {blog.postCount}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Wallet</p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {publicKey.toString().slice(0, 8)}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
