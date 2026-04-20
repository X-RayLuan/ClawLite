"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type BalanceAlertProps = {
  availableBalanceUsd: number;
  frozenBalanceUsd: number;
  onDismiss?: () => void;
};

export function BalanceAlert({ availableBalanceUsd, frozenBalanceUsd, onDismiss }: BalanceAlertProps) {
  // Critical: balance too low to process requests
  if (availableBalanceUsd < 0.1) {
    return (
      <div className="rounded-[20px] border border-red-300 bg-red-50/95 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-semibold text-red-700">Balance critically low</p>
              <p className="mt-1 text-sm text-red-600">
                Your available balance (${availableBalanceUsd.toFixed(2)}) is insufficient for API requests.
                Please add credits immediately to avoid service interruption.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
              <Link href="/clawrouter/dashboard/add-credits">Add Credits</Link>
            </Button>
            {onDismiss && (
              <button onClick={onDismiss} className="text-xs text-red-500 hover:text-red-700">
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Warning: balance getting low
  if (availableBalanceUsd < 1) {
    return (
      <div className="rounded-[20px] border border-orange-300 bg-orange-50/95 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-orange-700">Balance running low</p>
              <p className="mt-1 text-sm text-orange-600">
                Your available balance (${availableBalanceUsd.toFixed(2)}) is below $1.
                Consider adding credits soon to ensure uninterrupted service.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/clawrouter/dashboard/add-credits">Add Credits</Link>
            </Button>
            {onDismiss && (
              <button onClick={onDismiss} className="text-xs text-orange-500 hover:text-orange-700">
                Dismiss
              </button>
            )}
          </div>
        </div>
        {frozenBalanceUsd > 0 && (
          <p className="mt-2 text-xs text-orange-500">
            💡 ${frozenBalanceUsd.toFixed(2)} is being processed for pending requests and will be deducted shortly.
          </p>
        )}
      </div>
    );
  }

  return null;
}
