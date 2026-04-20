"use client";

import { useState } from "react";

type PromoValidationResult = {
  valid: boolean;
  code?: string;
  discountType?: "percentage" | "fixed" | "bonus";
  discountValue?: number;
  message?: string;
};

type PromoCodeInputProps = {
  onValidChange?: (code: string, result: PromoValidationResult) => void;
  onSubmit?: (code: string) => Promise<PromoValidationResult>;
};

export function PromoCodeInput({ onValidChange, onSubmit }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoValidationResult | null>(null);
  const [error, setError] = useState("");

  const handleValidate = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      let validationResult: PromoValidationResult;

      if (onSubmit) {
        validationResult = await onSubmit(code.trim());
      } else {
        // Default mock validation - in production, call /api/promo/validate
        await new Promise((resolve) => setTimeout(resolve, 500));
        const upperCode = code.trim().toUpperCase();
        if (upperCode === "SAVE10") {
          validationResult = {
            valid: true,
            code: upperCode,
            discountType: "percentage",
            discountValue: 10,
            message: "10% off your purchase!",
          };
        } else if (upperCode === "BONUS20") {
          validationResult = {
            valid: true,
            code: upperCode,
            discountType: "bonus",
            discountValue: 20,
            message: "Get $20 bonus credits!",
          };
        } else if (upperCode === "FIVER") {
          validationResult = {
            valid: true,
            code: upperCode,
            discountType: "fixed",
            discountValue: 5,
            message: "$5 off instantly!",
          };
        } else {
          validationResult = {
            valid: false,
            message: "Invalid promo code. Please try again.",
          };
        }
      }

      setResult(validationResult);
      if (validationResult.valid) {
        onValidChange?.(code.trim(), validationResult);
      }
    } catch {
      setError("Failed to validate promo code. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidate();
    }
  };

  return (
    <div className="mt-6">
      <label htmlFor="promoCode" className="text-sm font-medium text-stone-700">
        Promo Code (Optional)
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <input
            id="promoCode"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setResult(null);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter promo code"
            disabled={loading}
            className={`w-full rounded-2xl border bg-[rgba(248,244,237,0.72)] px-4 py-4 text-base text-stone-950 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              result?.valid === true
                ? "border-emerald-400 bg-emerald-50"
                : result?.valid === false
                  ? "border-red-400 bg-red-50"
                  : "border-stone-300"
            }`}
          />
          {result?.valid && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">✓</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleValidate}
          disabled={!code.trim() || loading}
          className="rounded-2xl border border-stone-300 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Validating..." : "Apply"}
        </button>
      </div>

      {/* Success message */}
      {result?.valid && result.message && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          <span>🎉</span>
          <span>{result.message}</span>
          {result.discountType === "percentage" && result.discountValue && (
            <span className="font-semibold">(-{result.discountValue}%)</span>
          )}
          {result.discountType === "bonus" && result.discountValue && (
            <span className="font-semibold">(+${result.discountValue} bonus)</span>
          )}
          {result.discountType === "fixed" && result.discountValue && (
            <span className="font-semibold">( -${result.discountValue})</span>
          )}
        </div>
      )}

      {/* Error message */}
      {(error || result?.valid === false) && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <span>❌</span>
          <span>{error || result?.message}</span>
        </div>
      )}
    </div>
  );
}
