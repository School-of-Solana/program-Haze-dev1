import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getProgramForRead } from "@/utils/program";
import { getPostPda, getBlogPda, getProfilePda } from "@/utils/pda";
import { Post, Profile, BlogAccount } from "@/types/blog";

export const useFetchPosts = (refresh?: number) => {
  const { connection } = useConnection();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const program = getProgramForRead(connection);
        
        // Fetch all post accounts
        const postAccounts = await program.account.postAccount.all();
        
        const fetchedPosts: Post[] = postAccounts.map((account: any) => ({
          author: account.account.author.toString(),
          postId: account.account.postId.toNumber(),
          title: account.account.title,
          content: account.account.content,
          createdAt: account.account.createdAt.toNumber(),
          updatedAt: account.account.updatedAt.toNumber(),
          commentCount: account.account.commentCount.toNumber(),
        }));

        // Sort by creation date (newest first)
        fetchedPosts.sort((a, b) => b.createdAt - a.createdAt);
        
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [connection, refresh]);

  return { posts, loading };
};

export const useFetchPost = (author: string, postId: number) => {
  const { connection } = useConnection();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const program = getProgramForRead(connection);
        const authorPubkey = new PublicKey(author);
        const [postPda] = getPostPda(authorPubkey, postId);

        const postAccount = await program.account.postAccount.fetch(postPda);

        setPost({
          author: postAccount.author.toString(),
          postId: postAccount.postId.toNumber(),
          title: postAccount.title,
          content: postAccount.content,
          createdAt: postAccount.createdAt.toNumber(),
          updatedAt: postAccount.updatedAt.toNumber(),
          commentCount: postAccount.commentCount.toNumber(),
        });
      } catch (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (author && postId !== undefined) {
      fetchPost();
    }
  }, [connection, author, postId]);

  return { post, loading };
};

export const useFetchProfile = (author: string | undefined) => {
  const { connection } = useConnection();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!author) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const program = getProgramForRead(connection);
        const authorPubkey = new PublicKey(author);
        const [profilePda] = getProfilePda(authorPubkey);

        const profileAccount = await program.account.profileAccount.fetch(profilePda);

        setProfile({
          author: profileAccount.author.toString(),
          displayName: profileAccount.displayName,
          bio: profileAccount.bio,
          avatarUrl: profileAccount.avatarUrl,
          joinedAt: profileAccount.joinedAt.toNumber(),
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [connection, author]);

  return { profile, loading };
};

export const useFetchBlog = (author: string | undefined) => {
  const { connection } = useConnection();
  const [blog, setBlog] = useState<BlogAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!author) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const program = getProgramForRead(connection);
        const authorPubkey = new PublicKey(author);
        const [blogPda] = getBlogPda(authorPubkey);

        const blogAccount = await program.account.blogAccount.fetch(blogPda);

        setBlog({
          author: blogAccount.author.toString(),
          postCount: blogAccount.postCount.toNumber(),
        });
      } catch (error) {
        console.error("Error fetching blog:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [connection, author]);

  return { blog, loading };
};
