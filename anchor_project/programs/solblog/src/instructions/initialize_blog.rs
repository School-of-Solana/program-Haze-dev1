use crate::events::BlogInitialized;
use crate::state::BlogAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeBlog<'info> {
    #[account(init, payer = author, space = BlogAccount::SPACE, seeds = [b"blog", author.key().as_ref()], bump)]
    pub blog_account: Account<'info, BlogAccount>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeBlog>) -> Result<()> {
    let blog = &mut ctx.accounts.blog_account;
    blog.author = *ctx.accounts.author.key;
    blog.post_count = 0;

    emit!(BlogInitialized {
        author: blog.author
    });
    Ok(())
}
