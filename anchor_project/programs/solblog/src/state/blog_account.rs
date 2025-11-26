use anchor_lang::prelude::*;

#[account]
pub struct BlogAccount {
    pub author: Pubkey,
    pub post_count: u64,
}

impl BlogAccount {
    pub const SPACE: usize = 8 + 32 + 8; // discriminator + pubkey + u64
}
