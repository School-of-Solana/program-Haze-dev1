use anchor_lang::prelude::*;

#[event]
pub struct BlogInitialized {
    pub author: Pubkey,
}

#[event]
pub struct PostCreated {
    pub author: Pubkey,
    pub post_id: u64,
}

#[event]
pub struct PostUpdated {
    pub author: Pubkey,
    pub post_id: u64,
}

#[event]
pub struct PostDeleted {
    pub author: Pubkey,
    pub post_id: u64,
}

#[event]
pub struct ProfileInitialized {
    pub author: Pubkey,
}

#[event]
pub struct CommentCreated {
    pub commenter: Pubkey,
    pub post_author: Pubkey,
    pub post_id: u64,
    pub comment_id: u64,
}
