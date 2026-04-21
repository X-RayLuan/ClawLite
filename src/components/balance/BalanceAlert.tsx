"use client";

import Link from "next/link";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { getContentForLang, getIntlLocale } from "@/lib/content";

type BalanceAlertProps = {
  availableBalanceUsd: number;
  frozenBalanceUsd: number;
  onDismiss?: () => void;
};

export function BalanceAlert({ availableBalanceUsd, frozenBalanceUsd, onDismiss }: BalanceAlertProps) {
  const { lang } = useLang();
  const locale = getIntlLocale(lang);
  const t = getContentForLang(lang).dashboard;
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const amount = currencyFormatter.format(availableBalanceUsd);

  // Critical: balance too low to process requests
  if (availableBalanceUsd < 0.1) {
    return (
      <div className="rounded-[20px] border border-red-300 bg-red-50/95 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-semibold text-red-700">{t.alert.criticalTitle}</p>
              <p className="mt-1 text-sm text-red-600">
                {t.alert.criticalMessage.replace("{amount}", amount)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
              <Link href="/clawrouter/dashboard/add-credits">{t.alert.addCredits}</Link>
            </Button>
            {onDismiss && (
              <button onClick={onDismiss} className="text-xs text-red-500 hover:text-red-700">
                {t.alert.dismiss}
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
              <p className="font-semibold text-orange-700">{t.alert.lowBalanceTitle}</p>
              <p className="mt-1 text-sm text-orange-600">
                {t.alert.lowBalanceMessage}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Link href="/clawrouter/dashboard/add-credits">{t.alert.addCredits}</Link>
            </Button>
            {onDismiss && (
              <button onClick={onDismiss} className="text-xs text-orange-500 hover:text-orange-700">
                {t.alert.dismiss}
              </button>
            )}
          </div>
        </div>
        {frozenBalanceUsd > 0 && (
          <p className="mt-2 text-xs text-orange-500">
            {t.alert.frozenHint.replace("{amount}", currencyFormatter.format(frozenBalanceUsd))}
          </p>
        )}
      </div>
    );
  }

  return null;
}
