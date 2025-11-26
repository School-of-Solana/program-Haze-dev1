use anchor_lang::prelude::*;

#[account]
pub struct CommentAccount {
    pub commenter: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
    pub comment_id: u64,
    pub content: String,
    pub created_at: i64,
}

impl CommentAccount {
    pub fn space(content: &String) -> usize {
        8 + 32 + 32 + 8 + 8 + 4 + content.len() + 8
        // discriminator + commenter + post_author + post_id + comment_id + content(prefix+len) + created_at
    }
}
