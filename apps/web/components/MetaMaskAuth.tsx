"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";
import { apiConfig } from "@/lib/api";
import { apiMe, apiNonce, apiSetProfile, apiVerify } from "@movie/api-client";
import { Button, Card, Input } from "./ui";
type EthProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
declare global { interface Window { ethereum?: EthProvider } }

export function MetaMaskAuth() {
  const cfg = useMemo(() => apiConfig(), []);
  const has = useMemo(() => typeof window !== "undefined" && !!window.ethereum, []);
  const [status, setStatus] = useState(has ? "Not connected" : "MetaMask not found");
  const [me, setMe] = useState<any>({ authed: false, user: null });
  const [needsProfile, setNeedsProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const refresh = useCallback(async () => {
    try { setMe(await apiMe(cfg)); } catch { setMe({ authed: false, user: null }); }
  }, [cfg]);

  useEffect(() => { refresh(); }, [refresh]);

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) return;
      setStatus("Connecting...");
      const provider = new BrowserProvider(window.ethereum as any);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const addr = (await signer.getAddress()).toLowerCase();
      const chainId = Number((await provider.getNetwork()).chainId);

      const { nonce } = await apiNonce(cfg);
      const msg = new SiweMessage({ domain: window.location.host, address: addr, statement: "Sign in to MovieVerse with MetaMask.", uri: window.location.origin, version: "1", chainId, nonce });
      const message = msg.prepareMessage();
      setStatus("Signing...");
      const signature = await signer.signMessage(message);

      setStatus("Verifying...");
      const res = await apiVerify(cfg, { message, signature });
      await refresh();
      setNeedsProfile(!!res.isNew);
      setStatus(res.isNew ? "Welcome! Finish profile 👇" : "Signed in ✅");
    } catch (e: any) { setStatus(e?.message ?? "Failed"); }
  }, [cfg, refresh]);

  const save = useCallback(async () => {
    try { setStatus("Saving..."); await apiSetProfile(cfg, { displayName }); setNeedsProfile(false); await refresh(); setStatus("All set ✅"); }
    catch (e: any) { setStatus(e?.message ?? "Failed"); }
  }, [cfg, displayName, refresh]);

  return (
    <Card className="grid gap-3">
      <div className="text-xs opacity-80">{status}</div>
      <Button onClick={connect} disabled={!has}>{has ? "Connect & Sign" : "Install MetaMask"}</Button>
      {me.authed ? <div className="text-xs opacity-80">Wallet: {String(me.user.walletAddress).slice(0,6)}…{String(me.user.walletAddress).slice(-4)}</div> : null}
      {me.authed && needsProfile ? (
        <div className="grid gap-2">
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="display name" />
          <Button onClick={save}>Save</Button>
        </div>
      ) : null}
    </Card>
  );
}
