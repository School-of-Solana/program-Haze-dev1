use anchor_lang::prelude::*;

declare_id!("97LDGVBJPc2TGqZu7UZZn4yWoHv2t9LojWXaoYhKnfdn");

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod blog {
    use super::*;

    pub fn initialize_blog(ctx: Context<InitializeBlog>) -> Result<()> {
        instructions::initialize_blog::handler(ctx)
    }

    pub fn create_post(ctx: Context<CreatePost>, title: String, content: String) -> Result<()> {
        instructions::create_post::handler(ctx, title, content)
    }

    pub fn update_post(
        ctx: Context<UpdatePost>,
        new_title: Option<String>,
        new_content: Option<String>,
    ) -> Result<()> {
        instructions::update_post::handler(ctx, new_title, new_content)
    }

    pub fn delete_post(ctx: Context<DeletePost>) -> Result<()> {
        instructions::delete_post::handler(ctx)
    }

    pub fn initialize_profile(
        ctx: Context<InitializeProfile>,
        display_name: String,
        bio: String,
        avatar_url: String,
    ) -> Result<()> {
        instructions::initialize_profile::handler(ctx, display_name, bio, avatar_url)
    }

    pub fn create_comment(ctx: Context<CreateComment>, content: String) -> Result<()> {
        instructions::create_comment::handler(ctx, content)
    }
}
