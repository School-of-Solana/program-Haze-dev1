import { PublicKey } from "@solana/web3.js";
import { BLOG_SEED, POST_SEED, PROFILE_SEED, COMMENT_SEED, PROGRAM_ID } from "./constants";

const programId = new PublicKey(PROGRAM_ID);

export const getBlogPda = (author: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BLOG_SEED), author.toBuffer()],
    programId
  );
};

export const getPostPda = (author: PublicKey, postId: number): [PublicKey, number] => {
  const postIdBuffer = Buffer.alloc(8);
  postIdBuffer.writeBigUInt64LE(BigInt(postId));
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from(POST_SEED), author.toBuffer(), postIdBuffer],
    programId
  );
};

export const getProfilePda = (author: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PROFILE_SEED), author.toBuffer()],
    programId
  );
};

export const getCommentPda = (
  postAuthor: PublicKey,
  postId: number,
  commentId: number
): [PublicKey, number] => {
  const postIdBuffer = Buffer.alloc(8);
  postIdBuffer.writeBigUInt64LE(BigInt(postId));
  
  const commentIdBuffer = Buffer.alloc(8);
  commentIdBuffer.writeBigUInt64LE(BigInt(commentId));
  
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(COMMENT_SEED),
      postAuthor.toBuffer(),
      postIdBuffer,
      commentIdBuffer,
    ],
    programId
  );
};
