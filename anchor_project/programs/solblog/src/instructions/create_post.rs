use crate::errors::BlogError;
use crate::events::PostCreated;
use crate::state::{BlogAccount, PostAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(title: String, content: String)]
pub struct CreatePost<'info> {
    #[account(mut, seeds = [b"blog", author.key().as_ref()], bump, has_one = author)]
    pub blog_account: Account<'info, BlogAccount>,

    #[account(init, payer = author, space = PostAccount::space(&title, &content), seeds = [b"post", author.key().as_ref(), &blog_account.post_count.to_le_bytes()], bump)]
    pub post_account: Account<'info, PostAccount>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreatePost>, title: String, content: String) -> Result<()> {
    require!(title.len() <= 128, BlogError::TitleTooLong);
    require!(content.len() <= 2048, BlogError::ContentTooLong);

    let blog = &mut ctx.accounts.blog_account;
    let post = &mut ctx.accounts.post_account;

    post.author = *ctx.accounts.author.key;
    post.post_id = blog.post_count;
    post.title = title.clone();
    post.content = content.clone();
    post.created_at = Clock::get()?.unix_timestamp;
    post.updated_at = post.created_at;
    post.comment_count = 0;

    blog.post_count = blog
        .post_count
        .checked_add(1)
        .ok_or(BlogError::NumericalOverflow)?;

    emit!(PostCreated {
        author: post.author,
        post_id: post.post_id
    });
    Ok(())
}
