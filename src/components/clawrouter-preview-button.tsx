"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ClawRouterPreviewButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch("/api/clawrouter/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          installerSetupToken: "local-preview",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.checkoutUrl) {
        throw new Error(payload?.error || "failed_to_create_checkout");
      }

      if (payload.checkoutUrl.startsWith("http://") || payload.checkoutUrl.startsWith("https://")) {
        window.location.href = payload.checkoutUrl;
        return;
      }

      router.push(payload.checkoutUrl);
    } catch {
      router.push("/clawrouter/checkout?session=preview-fallback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" className={fullWidth ? "w-full shadow-glow" : "shadow-glow"} onClick={handleClick} disabled={loading}>
      {loading ? "Opening checkout..." : "Start managed checkout"}
    </Button>
  );
}
