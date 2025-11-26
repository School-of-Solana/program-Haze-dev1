use anchor_lang::prelude::*;

#[account]
pub struct ProfileAccount {
    pub author: Pubkey,
    pub display_name: String,
    pub bio: String,
    pub avatar_url: String,
    pub joined_at: i64,
}

impl ProfileAccount {
    pub fn space(display_name: &String, bio: &String, avatar_url: &String) -> usize {
        8 + 32 + 4 + display_name.len() + 4 + bio.len() + 4 + avatar_url.len() + 8
    }
}
