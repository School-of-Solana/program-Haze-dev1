"use client";

import React, { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Toaster } from "react-hot-toast";

require("@solana/wallet-adapter-react-ui/styles.css");

export const WalletProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use devnet
  const network = WalletAdapterNetwork.Devnet;
  // Connect to devnet
  const endpoint = useMemo(() => "https://api.devnet.solana.com", []);
  
  // Connection config for better reliability
  const connectionConfig = useMemo(
    () => ({
      commitment: "confirmed" as const,
      confirmTransactionInitialTimeout: 60000,
    }),
    []
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Toaster position="bottom-right" />
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
