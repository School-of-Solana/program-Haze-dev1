use anchor_lang::prelude::*;

#[error_code]
pub enum BlogError {
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Content too long")]
    ContentTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Numerical overflow")]
    NumericalOverflow,
    #[msg("Comment too long")]
    CommentTooLong,
}
