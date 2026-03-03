"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MetaMaskAuth } from "@/components/MetaMaskAuth";
import { Card } from "@/components/ui";

export default function AuthPage() {
  const router = useRouter();
  const onAuthed = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Card className="mb-6">
        <h1 className="text-3xl font-black">Sign in with MetaMask</h1>
        <p className="mt-2 text-sm opacity-80">Create your MovieVerse account or log in using your wallet, then you'll be redirected to movies.</p>
      </Card>

      <MetaMaskAuth onAuthed={onAuthed} />

      <div className="mt-6 text-sm opacity-80">
        <Link href="/" className="hover:opacity-100">Back to home</Link>
      </div>
    </main>
  );
}
