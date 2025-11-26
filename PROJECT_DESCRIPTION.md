# Project Description

**Deployed Frontend URL:** https://solblog-haze.vercel.app/

**Solana Program ID:** 97LDGVBJPc2TGqZu7UZZn4yWoHv2t9LojWXaoYhKnfdn

## Project Overview

### Description
Solblog is a decentralized blogging platform built on Solana that allows users to create, update, and delete blog posts with comment functionality. The program manages blog accounts, user profiles, posts, and comments using Program Derived Addresses (PDAs) for deterministic account creation and ownership verification.

### Key Features
- Initialize personal blog accounts for publishing posts
- Create and manage user profiles with display name, bio, and avatar
- Create blog posts with title (max 128 chars) and content (max 2048 chars)
- Update existing posts with new title or content (title max 100 chars, content max 5000 chars)
- Delete posts with automatic rent reclamation
- Add comments to posts (max 1024 chars)
- Track post and comment counts per blog and post
  
### How to Use the dApp
1. **Connect Wallet** - Connect your Solana wallet to interact with the dApp
2. **Initialize Blog** - Create your blog account to start publishing posts
3. **Create Profile** - Set up your profile with display name, bio, and avatar URL
4. **Create Post** - Write and publish blog posts with title and content
5. **Update Post** - Edit your existing posts to modify title or content
6. **Delete Post** - Remove posts you no longer want published (reclaims rent)
7. **Add Comments** - Comment on any post to engage with content

## Program Architecture

The program uses a modular architecture with separate instruction handlers, state accounts, custom errors, and event emissions. All accounts are derived using PDAs to ensure deterministic addresses and proper authorization.

### PDA Usage

Program Derived Addresses (PDAs) are used throughout the project to create deterministic, ownerless accounts that can only be controlled by the program. Each PDA uses specific seeds to ensure uniqueness and enable authorization checks without requiring signatures.

**PDAs Used:**
- **Blog Account PDA** - Seeds: `["blog", author_pubkey]` - One blog per user, tracks total post count
- **Post Account PDA** - Seeds: `["post", author_pubkey, post_id]` - Each post has unique ID, scoped to author
- **Profile Account PDA** - Seeds: `["profile", author_pubkey]` - One profile per user for display information
- **Comment Account PDA** - Seeds: `["comment", post_author_pubkey, post_id, comment_id]` - Each comment tracked by post and comment ID

### Program Instructions

**Instructions Implemented:**
- **initialize_blog** - Creates a blog account for an author, initializes post count to 0
- **initialize_profile** - Creates user profile with display name, bio, avatar URL, and joined timestamp
- **create_post** - Creates new post with title and content, increments blog post count
- **update_post** - Updates existing post title and/or content, only by post author
- **delete_post** - Closes post account and returns rent to author
- **create_comment** - Adds comment to a post, increments post comment count

### Account Structure

The program defines four main account structures. BlogAccount tracks user's blog metadata and post count. PostAccount stores individual post data with timestamps and comment tracking. ProfileAccount holds user profile information. CommentAccount manages user comments on posts with proper association to both commenter and post.

```rust
#[account]
pub struct BlogAccount {
    pub author: Pubkey,      // 32 bytes
    pub post_count: u64,     // 8 bytes
}

#[account]
pub struct PostAccount {
    pub author: Pubkey,      // 32 bytes
    pub post_id: u64,        // 8 bytes
    pub title: String,       // 4 + title.len()
    pub content: String,     // 4 + content.len()
    pub created_at: i64,     // 8 bytes
    pub updated_at: i64,     // 8 bytes
    pub comment_count: u64,  // 8 bytes
}

#[account]
pub struct ProfileAccount {
    pub author: Pubkey,       // 32 bytes
    pub display_name: String, // 4 + display_name.len()
    pub bio: String,          // 4 + bio.len()
    pub avatar_url: String,   // 4 + avatar_url.len()
    pub joined_at: i64,       // 8 bytes
}

#[account]
pub struct CommentAccount {
    pub commenter: Pubkey,    // 32 bytes
    pub post_author: Pubkey,  // 32 bytes
    pub post_id: u64,         // 8 bytes
    pub comment_id: u64,      // 8 bytes
    pub content: String,      // 4 + content.len()
    pub created_at: i64,      // 8 bytes
}
```

## Testing

### Test Coverage

The test suite provides comprehensive coverage using Anchor's testing framework with Mocha and Chai. Tests cover all instructions in both successful execution paths and error scenarios. The tests verify PDA derivation, account initialization, state updates, authorization checks, and proper error handling for edge cases.

**Happy Path Tests:**
- Initialize blog account successfully
- Initialize profile account with display name, bio, and avatar
- Create first post and verify blog post count increments
- Create second post with different post_id
- Update post content with same length string
- Update both title and content
- Create first comment on post and verify comment count increments
- Create second comment on same post
- Delete post successfully and verify account closure
- Create blogs for multiple different users

**Unhappy Path Tests:**
- Fail to initialize blog twice for same author (duplicate account error)
- Fail to create post with title exceeding 128 characters (TitleTooLong error)
- Fail to update post by unauthorized user (Unauthorized error)
- Fail to delete post by unauthorized user (Unauthorized error)
- Verify post still exists after failed unauthorized delete attempt

**Error Codes Tested:**
- TitleTooLong - Title exceeds maximum allowed length
- ContentTooLong - Content exceeds maximum allowed length
- Unauthorized - User attempting action they're not authorized for
- NumericalOverflow - Protection against counter overflow
- CommentTooLong - Comment exceeds maximum allowed length

### Running Tests
```bash
anchor test
```