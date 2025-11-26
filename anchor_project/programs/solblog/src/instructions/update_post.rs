use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;

pub fn handler(
    ctx: Context<UpdatePost>,
    title: Option<String>,
    content: Option<String>,
) -> Result<()> {
    let post = &mut ctx.accounts.post_account;

    require!(
        post.author == *ctx.accounts.author.key,
        BlogError::Unauthorized
    );

    if let Some(t) = title {
        require!(t.len() <= 100, BlogError::TitleTooLong);
        post.title = t;
    }

    if let Some(c) = content {
        require!(c.len() <= 5000, BlogError::ContentTooLong);
        post.content = c;
    }

    post.updated_at = Clock::get()?.unix_timestamp;

    emit!(PostUpdated {
        author: post.author,
        post_id: post.post_id
    });
    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePost<'info> {
    #[account(
        mut,
        seeds = [b"post", post_account.author.key().as_ref(), &post_account.post_id.to_le_bytes()],
        bump
    )]
    pub post_account: Account<'info, PostAccount>,

    #[account(mut)]
    pub author: Signer<'info>,
}
