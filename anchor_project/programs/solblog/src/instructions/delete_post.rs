use crate::errors::BlogError;
use crate::events::PostDeleted;
use crate::state::PostAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeletePost<'info> {
    #[account(mut, close = author, seeds = [b"post", post_account.author.key().as_ref(), &post_account.post_id.to_le_bytes()], bump)]
    pub post_account: Account<'info, PostAccount>,

    #[account(mut)]
    pub author: Signer<'info>,
}

pub fn handler(ctx: Context<DeletePost>) -> Result<()> {
    let post = &ctx.accounts.post_account;
    require!(
        post.author == *ctx.accounts.author.key,
        BlogError::Unauthorized
    );

    emit!(PostDeleted {
        author: post.author,
        post_id: post.post_id
    });
    Ok(())
}
