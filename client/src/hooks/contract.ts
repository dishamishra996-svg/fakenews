"use client";

import { useState, useEffect, useCallback } from "react";
import { Client, networks } from "contract";
import type { ContentItem, TrustedSource, Verification } from "contract";
import * as freighter from "@stellar/freighter-api";
import { TransactionBuilder } from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";

// ── Configuration ──────────────────────────────────────────────────────────
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
const CONTRACT_ID = networks.testnet.contractId;

// ── Wallet Helpers ──────────────────────────────────────────────────────────

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export function useWallet(): WalletState & { connect: () => Promise<void> } {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const resp = await freighter.isConnected();
      if (resp.isConnected) {
        const addrResp = await freighter.getAddress();
        setAddress(addrResp.address);
        setIsConnected(true);
      }
    } catch {
      // silently ignore
    }
  }

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const addrResp = await freighter.getAddress();
      setAddress(addrResp.address);
      setIsConnected(true);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return { address, isConnected, isConnecting, connect };
}

// ── Init Client ─────────────────────────────────────────────────────────────

function getClient() {
  return new Client({
    rpcUrl: RPC_URL,
    networkPassphrase: NETWORK_PASSPHRASE,
    contractId: CONTRACT_ID,
  });
}

// ── Sign & Send Helper ──────────────────────────────────────────────────────

async function signAndSend<T>(
  tx: { toXDR: () => string }
): Promise<string> {
  const auth = await freighter.signTransaction(
    tx.toXDR(),
    { networkPassphrase: NETWORK_PASSPHRASE }
  );

  const server = new rpc.Server(RPC_URL);
  const envelope = TransactionBuilder.fromXDR(auth.signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(envelope);

  if (result.status === "PENDING" || result.status === "DUPLICATE") {
    const hash = result.hash;
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      const txResult = await server.getTransaction(hash);
      if (txResult.status === "SUCCESS") return hash;
      if (txResult.status === "FAILED") throw new Error("Transaction failed");
      attempts++;
    }
    throw new Error("Transaction timeout");
  }
  throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
}

// ── Contract API Functions ──────────────────────────────────────────────────

export async function initializeContract(admin: string): Promise<string> {
  const client = getClient();
  const tx = await client.initialize({ admin });
  return signAndSend(tx);
}

export async function submitContent(
  submitter: string,
  contentId: string,
  contentHash: string,
  contentType: string
): Promise<string> {
  const client = getClient();
  const tx = await client.submit_content({
    submitter,
    content_id: contentId,
    content_hash: contentHash,
    content_type: contentType,
  });
  return signAndSend(tx);
}

export async function verifyContent(
  verifier: string,
  contentId: string,
  trustScore: number
): Promise<string> {
  const client = getClient();
  const tx = await client.verify_content({
    verifier,
    content_id: contentId,
    trust_score: trustScore,
  });
  return signAndSend(tx);
}

export async function reportContent(
  reporter: string,
  contentId: string
): Promise<string> {
  const client = getClient();
  const tx = await client.report_content({
    reporter,
    content_id: contentId,
  });
  return signAndSend(tx);
}

export async function getContent(contentId: string): Promise<ContentItem | null> {
  try {
    const client = getClient();
    const tx = await client.get_content({ content_id: contentId });
    return tx.result;
  } catch {
    return null;
  }
}

export async function addTrustedSource(
  admin: string,
  source: string,
  name: string,
  url: string
): Promise<string> {
  const client = getClient();
  const tx = await client.add_trusted_source({ admin, source, name, url });
  return signAndSend(tx);
}

export async function removeTrustedSource(
  admin: string,
  source: string
): Promise<string> {
  const client = getClient();
  const tx = await client.remove_trusted_source({ admin, source });
  return signAndSend(tx);
}

export async function isTrustedSource(source: string): Promise<boolean> {
  try {
    const client = getClient();
    const tx = await client.is_trusted_source({ source });
    return tx.result;
  } catch {
    return false;
  }
}

export async function getTrustedSource(source: string): Promise<TrustedSource | null> {
  try {
    const client = getClient();
    const tx = await client.get_trusted_source({ source });
    return tx.result;
  } catch {
    return null;
  }
}

export async function getUserReputation(user: string): Promise<number> {
  try {
    const client = getClient();
    const tx = await client.get_reputation({ user });
    return Number(tx.result);
  } catch {
    return 0;
  }
}

export async function getContentCount(): Promise<number> {
  try {
    const client = getClient();
    const tx = await client.get_content_count();
    return Number(tx.result);
  } catch {
    return 0;
  }
}

export async function getVerifications(contentId: string): Promise<Verification[]> {
  try {
    const client = getClient();
    const tx = await client.get_verifications({ content_id: contentId });
    return tx.result as Verification[];
  } catch {
    return [];
  }
}

// Re-export types for convenience
export type { ContentItem, TrustedSource, Verification };
