use crate::events::ProfileInitialized;
use crate::state::ProfileAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(display_name: String, bio: String, avatar_url: String)]
pub struct InitializeProfile<'info> {
    #[account(init, payer = author, space = ProfileAccount::space(&display_name, &bio, &avatar_url), seeds = [b"profile", author.key().as_ref()], bump)]
    pub profile_account: Account<'info, ProfileAccount>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeProfile>,
    display_name: String,
    bio: String,
    avatar_url: String,
) -> Result<()> {
    let profile = &mut ctx.accounts.profile_account;
    profile.author = *ctx.accounts.author.key;
    profile.display_name = display_name;
    profile.bio = bio;
    profile.avatar_url = avatar_url;
    profile.joined_at = Clock::get()?.unix_timestamp;

    emit!(ProfileInitialized {
        author: profile.author
    });
    Ok(())
}
