"use client";
import React, { FC, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    // const endpoint =
    //     "https://solana-mainnet.g.alchemy.com/v2/5yclaxyqDI0AOOziQGTnFW1P9zTNmcXX";
    const endpoint =
        "https://solana-devnet.g.alchemy.com/v2/XzQB9nmEq29GciXf4cJz3ebarFP4Zubx";

    const wallets = useMemo(() => [], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
