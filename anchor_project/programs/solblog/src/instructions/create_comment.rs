use crate::errors::BlogError;
use crate::events::CommentCreated;
use crate::state::{CommentAccount, PostAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(content: String)]
pub struct CreateComment<'info> {
    /// The post's account (owner of the post)
    #[account(
        mut,
        seeds = [b"post", post_account.author.key().as_ref(), &post_account.post_id.to_le_bytes()],
        bump
    )]
    pub post_account: Account<'info, PostAccount>,

    /// The comment account to be created
    #[account(
        init,
        payer = commenter,
        space = CommentAccount::space(&content),
        seeds = [b"comment", post_account.author.key().as_ref(), &post_account.post_id.to_le_bytes(), &post_account.comment_count.to_le_bytes()],
        bump
    )]
    pub comment_account: Account<'info, CommentAccount>,

    #[account(mut)]
    pub commenter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateComment>, content: String) -> Result<()> {
    require!(content.len() <= 1024, BlogError::CommentTooLong);

    let post = &mut ctx.accounts.post_account;
    let comment = &mut ctx.accounts.comment_account;

    comment.commenter = *ctx.accounts.commenter.key;
    comment.post_author = post.author;
    comment.post_id = post.post_id;
    comment.comment_id = post.comment_count;
    comment.content = content.clone();
    comment.created_at = Clock::get()?.unix_timestamp;

    // increment post's comment_count
    post.comment_count = post
        .comment_count
        .checked_add(1)
        .ok_or(BlogError::NumericalOverflow)?;

    emit!(CommentCreated {
        commenter: comment.commenter,
        post_author: comment.post_author,
        post_id: comment.post_id,
        comment_id: comment.comment_id,
    });

    Ok(())
}
