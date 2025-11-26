use anchor_lang::prelude::*;

#[account]
pub struct PostAccount {
    pub author: Pubkey,
    pub post_id: u64,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub comment_count: u64,
}

impl PostAccount {
    pub fn space(title: &String, content: &String) -> usize {
        8 + 32 + 8 + 4 + title.len() + 4 + content.len() + 8 + 8 + 8
        // discriminator + author + post_id + title(prefix+len) + content(prefix+len) + created_at + updated_at + comment_count
    }
}
