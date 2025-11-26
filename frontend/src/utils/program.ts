import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../../../target/idl/blog.json";
import { Blog } from "../../../target/types/blog";
import { PROGRAM_ID } from "./constants";

export const getProgram = (
  connection: Connection,
  wallet: AnchorWallet
): Program<Blog> => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "processed",
    skipPreflight: false,
  });
  
  return new Program(idl as any, provider);
};

export const getProgramForRead = (connection: Connection): Program<Blog> => {
  const provider = new AnchorProvider(
    connection,
    {} as AnchorWallet,
    {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    }
  );
  
  return new Program(idl as any, provider);
};
