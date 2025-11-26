import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram } from "@/utils/program";
import { getBlogPda, getPostPda, getProfilePda, getCommentPda } from "@/utils/pda";
import toast from "react-hot-toast";

export const useBlog = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const initializeBlog = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const program = getProgram(connection, wallet);
      const [blogPda] = getBlogPda(wallet.publicKey);

      await program.methods
        .initializeBlog()
        .accountsPartial({
          blogAccount: blogPda,
          author: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Blog initialized successfully!");
      return blogPda;
    } catch (error: any) {
      console.error("Error initializing blog:", error);
      toast.error(error.message || "Failed to initialize blog");
      throw error;
    }
  };

  const createPost = async (title: string, content: string) => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const program = getProgram(connection, wallet);
      const [blogPda] = getBlogPda(wallet.publicKey);

      // Fetch blog account to get post count
      const blogAccount = await program.account.blogAccount.fetch(blogPda);
      const postId = blogAccount.postCount.toNumber();

      const [postPda] = getPostPda(wallet.publicKey, postId);

      await program.methods
        .createPost(title, content)
        .accountsPartial({
          blogAccount: blogPda,
          postAccount: postPda,
          author: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Post created successfully!");
      return postPda;
    } catch (error: any) {
      console.error("Error creating post:", error);
      
      // Check if blog needs to be initialized
      if (error.message?.includes("Account does not exist")) {
        toast.error("Please initialize your blog first");
        await initializeBlog();
        return;
      }
      
      toast.error(error.message || "Failed to create post");
      throw error;
    }
  };

  const updatePost = async (postId: number, title?: string, content?: string) => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const program = getProgram(connection, wallet);
      const [postPda] = getPostPda(wallet.publicKey, postId);

      await program.methods
        .updatePost(title || null, content || null)
        .accountsPartial({
          postAccount: postPda,
          author: wallet.publicKey,
        })
        .rpc();

      toast.success("Post updated successfully!");
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error(error.message || "Failed to update post");
      throw error;
    }
  };

  const deletePost = async (postId: number) => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const program = getProgram(connection, wallet);
      const [blogPda] = getBlogPda(wallet.publicKey);
      const [postPda] = getPostPda(wallet.publicKey, postId);

      await program.methods
        .deletePost()
        .accountsPartial({
          postAccount: postPda,
          author: wallet.publicKey,
        })
        .rpc();

      toast.success("Post deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
      throw error;
    }
  };

  const createComment = async (postAuthor: PublicKey, postId: number, content: string) => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const program = getProgram(connection, wallet);
      const [postPda] = getPostPda(postAuthor, postId);

      // Fetch post to get comment count
      const postAccount = await program.account.postAccount.fetch(postPda);
      const commentId = postAccount.commentCount.toNumber();

      const [commentPda] = getCommentPda(postAuthor, postId, commentId);

      await program.methods
        .createComment(content)
        .accountsPartial({
          postAccount: postPda,
          commentAccount: commentPda,
          commenter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Comment added successfully!");
      return commentPda;
    } catch (error: any) {
      console.error("Error creating comment:", error);
      toast.error(error.message || "Failed to create comment");
      throw error;
    }
  };

  const initializeProfile = async (
    displayName: string,
    bio: string,
    avatarUrl: string
  ) => {
    if (!wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const program = getProgram(connection, wallet);
      const [profilePda] = getProfilePda(wallet.publicKey);

      await program.methods
        .initializeProfile(displayName, bio, avatarUrl)
        .accountsPartial({
          profileAccount: profilePda,
          author: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Profile created successfully!");
      return profilePda;
    } catch (error: any) {
      console.error("Error initializing profile:", error);
      toast.error(error.message || "Failed to create profile");
      throw error;
    }
  };

  return {
    initializeBlog,
    createPost,
    updatePost,
    deletePost,
    createComment,
    initializeProfile,
  };
};
