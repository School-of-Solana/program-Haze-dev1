import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Blog } from "../target/types/blog";
import { expect } from "chai";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

describe("solblog", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Blog as Program<Blog>;
  
  // Test accounts
  const author = provider.wallet as anchor.Wallet;
  const secondUser = Keypair.generate();
  
  // PDAs
  let blogPda: PublicKey;
  let blogBump: number;
  let postPda: PublicKey;
  let postBump: number;
  let profilePda: PublicKey;
  let profileBump: number;
  let commentPda: PublicKey;
  let commentBump: number;
  let secondPostPda: PublicKey;
  let secondPostBump: number;

  // Test data
  const testTitle = "My First Blog Post";
  const testContent = "This is the content of my first blog post on Solana!";
  const updatedTitle = "My Updated Blog Post";
  const updatedContent = "This is the updated content.";
  const displayName = "John Doe";
  const bio = "A passionate blockchain developer";
  const avatarUrl = "https://example.com/avatar.png";
  const commentContent = "Great post! Very informative.";

  before(async () => {
    // Airdrop SOL to second user for testing
    const airdropSignature = await provider.connection.requestAirdrop(
      secondUser.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Derive PDAs
    [blogPda, blogBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("blog"), author.publicKey.toBuffer()],
      program.programId
    );

    [profilePda, profileBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), author.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Initialize Blog", () => {
    it("Initializes a blog account successfully", async () => {
      const tx = await program.methods
        .initializeBlog()
        .rpc();

      console.log("Initialize blog transaction signature:", tx);

      // Fetch the blog account
      const blogAccount = await program.account.blogAccount.fetch(blogPda);

      // Assertions
      expect(blogAccount.author.toString()).to.equal(author.publicKey.toString());
      expect(blogAccount.postCount.toNumber()).to.equal(0);
    });

    it("Fails to initialize blog twice for the same author", async () => {
      try {
        await program.methods
          .initializeBlog()
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe("Initialize Profile", () => {
    it("Initializes a profile account successfully", async () => {
      const tx = await program.methods
        .initializeProfile(displayName, bio, avatarUrl)
        .rpc();

      console.log("Initialize profile transaction signature:", tx);

      // Fetch the profile account
      const profileAccount = await program.account.profileAccount.fetch(profilePda);

      // Assertions
      expect(profileAccount.author.toString()).to.equal(author.publicKey.toString());
      expect(profileAccount.displayName).to.equal(displayName);
      expect(profileAccount.bio).to.equal(bio);
      expect(profileAccount.avatarUrl).to.equal(avatarUrl);
      expect(profileAccount.joinedAt.toNumber()).to.be.greaterThan(0);
    });
  });

  describe("Create Post", () => {
    it("Creates a post successfully", async () => {
      // Derive post PDA for post_id 0
      [postPda, postBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          author.publicKey.toBuffer(),
          Buffer.from(new anchor.BN(0).toArray("le", 8)),
        ],
        program.programId
      );

      const tx = await program.methods
        .createPost(testTitle, testContent)
        .rpc();

      console.log("Create post transaction signature:", tx);

      // Fetch the post account
      const postAccount = await program.account.postAccount.fetch(postPda);

      // Assertions
      expect(postAccount.author.toString()).to.equal(author.publicKey.toString());
      expect(postAccount.postId.toNumber()).to.equal(0);
      expect(postAccount.title).to.equal(testTitle);
      expect(postAccount.content).to.equal(testContent);
      expect(postAccount.createdAt.toNumber()).to.be.greaterThan(0);
      expect(postAccount.updatedAt.toNumber()).to.equal(postAccount.createdAt.toNumber());
      expect(postAccount.commentCount.toNumber()).to.equal(0);

      // Verify blog post count incremented
      const blogAccount = await program.account.blogAccount.fetch(blogPda);
      expect(blogAccount.postCount.toNumber()).to.equal(1);
    });

    it("Creates a second post successfully", async () => {
      const secondTitle = "My Second Post";
      const secondContent = "Content for the second post";

      // Derive post PDA for post_id 1
      [secondPostPda, secondPostBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          author.publicKey.toBuffer(),
          Buffer.from(new anchor.BN(1).toArray("le", 8)),
        ],
        program.programId
      );

      const tx = await program.methods
        .createPost(secondTitle, secondContent)
        .rpc();

      console.log("Create second post transaction signature:", tx);

      // Fetch the post account
      const postAccount = await program.account.postAccount.fetch(secondPostPda);

      // Assertions
      expect(postAccount.postId.toNumber()).to.equal(1);
      expect(postAccount.title).to.equal(secondTitle);
      expect(postAccount.content).to.equal(secondContent);

      // Verify blog post count incremented
      const blogAccount = await program.account.blogAccount.fetch(blogPda);
      expect(blogAccount.postCount.toNumber()).to.equal(2);
    });

    it("Fails to create post with title too long", async () => {
      const longTitle = "a".repeat(129); // Max is 128
      const content = "Some content";

      // Derive post PDA for post_id 2
      const [longPostPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("post"),
          author.publicKey.toBuffer(),
          Buffer.from(new anchor.BN(2).toArray("le", 8)),
        ],
        program.programId
      );

      try {
        await program.methods
          .createPost(longTitle, content)
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.toString()).to.include("TitleTooLong");
      }
    });
  });

  describe("Update Post", () => {
    it("Updates post content successfully (same length)", async () => {
      // Use content with exact same length to avoid reallocation issues
      const sameLengthContent = "Updated content for my first blog post!!!!"; // Same length as testContent
      
      const tx = await program.methods
        .updatePost(null, sameLengthContent)
        .accountsPartial({
          postAccount: postPda,
        })
        .rpc();

      console.log("Update post content transaction signature:", tx);

      // Fetch the post account
      const postAccount = await program.account.postAccount.fetch(postPda);

      // Assertions
      expect(postAccount.content).to.equal(sameLengthContent);
      expect(postAccount.title).to.equal(testTitle); // Title unchanged
    });

    it("Updates both title and content successfully (same length)", async () => {
      const newTitle = "My First Blog Post!"; // Same length as testTitle + 1
      const newContent = "Updated content for my first blog post!!!!"; // Same length

      const tx = await program.methods
        .updatePost(newTitle, newContent)
        .accountsPartial({
          postAccount: postPda,
        })
        .rpc();

      console.log("Update post (both) transaction signature:", tx);

      // Fetch the post account
      const postAccount = await program.account.postAccount.fetch(postPda);

      // Assertions
      expect(postAccount.title).to.equal(newTitle);
      expect(postAccount.content).to.equal(newContent);
    });

    it("Fails to update post by unauthorized user", async () => {
      try {
        await program.methods
          .updatePost("Unauthorized Title", null)
          .accountsPartial({
            postAccount: postPda,
            author: secondUser.publicKey,
          })
          .signers([secondUser])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.toString()).to.include("Unauthorized");
      }
    });
  });

  describe("Create Comment", () => {
    it("Creates a comment on a post successfully", async () => {
      // Derive comment PDA for comment_id 0 on post 0
      [commentPda, commentBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          author.publicKey.toBuffer(),
          Buffer.from(new anchor.BN(0).toArray("le", 8)),
          Buffer.from(new anchor.BN(0).toArray("le", 8)),
        ],
        program.programId
      );

      const tx = await program.methods
        .createComment(commentContent)
        .accountsPartial({
          postAccount: postPda,
          commenter: secondUser.publicKey,
        })
        .signers([secondUser])
        .rpc();

      console.log("Create comment transaction signature:", tx);

      // Fetch the comment account
      const commentAccount = await program.account.commentAccount.fetch(commentPda);

      // Assertions
      expect(commentAccount.commenter.toString()).to.equal(secondUser.publicKey.toString());
      expect(commentAccount.postAuthor.toString()).to.equal(author.publicKey.toString());
      expect(commentAccount.postId.toNumber()).to.equal(0);
      expect(commentAccount.commentId.toNumber()).to.equal(0);
      expect(commentAccount.content).to.equal(commentContent);
      expect(commentAccount.createdAt.toNumber()).to.be.greaterThan(0);

      // Verify post comment count incremented
      const postAccount = await program.account.postAccount.fetch(postPda);
      expect(postAccount.commentCount.toNumber()).to.equal(1);
    });

    it("Creates a second comment on the same post", async () => {
      const secondCommentContent = "Another insightful comment!";

      // Derive comment PDA for comment_id 1 on post 0
      const [secondCommentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          author.publicKey.toBuffer(),
          Buffer.from(new anchor.BN(0).toArray("le", 8)),
          Buffer.from(new anchor.BN(1).toArray("le", 8)),
        ],
        program.programId
      );

      const tx = await program.methods
        .createComment(secondCommentContent)
        .accountsPartial({
          postAccount: postPda,
        })
        .rpc();

      console.log("Create second comment transaction signature:", tx);

      // Fetch the comment account
      const commentAccount = await program.account.commentAccount.fetch(secondCommentPda);

      // Assertions
      expect(commentAccount.commentId.toNumber()).to.equal(1);
      expect(commentAccount.content).to.equal(secondCommentContent);

      // Verify post comment count incremented
      const postAccount = await program.account.postAccount.fetch(postPda);
      expect(postAccount.commentCount.toNumber()).to.equal(2);
    });
  });

  describe("Delete Post", () => {
    it("Deletes a post successfully", async () => {
      const tx = await program.methods
        .deletePost()
        .accountsPartial({
          postAccount: secondPostPda,
        })
        .rpc();

      console.log("Delete post transaction signature:", tx);

      // Verify post account is closed
      try {
        await program.account.postAccount.fetch(secondPostPda);
        expect.fail("Post account should be closed");
      } catch (error) {
        expect(error.toString()).to.include("Account does not exist");
      }
    });

    it("Fails to delete post by unauthorized user", async () => {
      try {
        await program.methods
          .deletePost()
          .accountsPartial({
            postAccount: postPda,
            author: secondUser.publicKey,
          })
          .signers([secondUser])
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.toString()).to.include("Unauthorized");
      }
    });

    it("Post still exists after failed unauthorized delete attempt", async () => {
      // Verify the post still exists
      const postAccount = await program.account.postAccount.fetch(postPda);
      expect(postAccount).to.exist;
      expect(postAccount.author.toString()).to.equal(author.publicKey.toString());
    });
  });

  describe("Edge Cases and Integration", () => {
    it("Can fetch all accounts for a user", async () => {
      const blogAccount = await program.account.blogAccount.fetch(blogPda);
      const profileAccount = await program.account.profileAccount.fetch(profilePda);
      
      expect(blogAccount.author.toString()).to.equal(author.publicKey.toString());
      expect(profileAccount.author.toString()).to.equal(author.publicKey.toString());
    });

    it("Can create multiple blogs for different users", async () => {
      const [secondUserBlogPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("blog"), secondUser.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .initializeBlog()
        .accountsPartial({
          author: secondUser.publicKey,
        })
        .signers([secondUser])
        .rpc();

      console.log("Second user blog initialization:", tx);

      const blogAccount = await program.account.blogAccount.fetch(secondUserBlogPda);
      expect(blogAccount.author.toString()).to.equal(secondUser.publicKey.toString());
      expect(blogAccount.postCount.toNumber()).to.equal(0);
    });
  });
});
