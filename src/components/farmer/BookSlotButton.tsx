"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type BookSlotButtonProps = {
  slotId: string;
  commodityId: string;
  estimatedQuantityQtl: number | null;
  disabled?: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function BookSlotButton({
  slotId,
  commodityId,
  estimatedQuantityQtl,
  disabled = false,
}: BookSlotButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  async function handleBookSlot() {
    if (loading || disabled) {
      return;
    }

    if (!commodityId) {
      setError("Please select a crop first.");
      return;
    }

    if (
      estimatedQuantityQtl === null ||
      !Number.isFinite(estimatedQuantityQtl) ||
      estimatedQuantityQtl <= 0
    ) {
      setError(
        "Please enter a valid estimated quantity."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError(
          "Your session has expired. Please log in again."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            slot_id: slotId,
            commodity_id: commodityId,
            estimated_quantity_qtl:
              estimatedQuantityQtl,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            "Unable to book this slot."
        );
        setLoading(false);
        return;
      }

      const booking = result.data;

      if (!booking?.id) {
        console.error(
          "Unexpected booking response:",
          result
        );

        setError(
          "Booking was created, but the booking details could not be loaded."
        );
        setLoading(false);
        return;
      }

      router.push(`/booking/${booking.id}`);
    } catch (error) {
      console.error(
        "Unexpected booking error:",
        error
      );

      setError(
        "Unable to connect to the booking service. Please try again."
      );

      setLoading(false);
    }
  }

  const buttonDisabled =
    disabled ||
    loading ||
    !commodityId ||
    estimatedQuantityQtl === null ||
    !Number.isFinite(estimatedQuantityQtl) ||
    estimatedQuantityQtl <= 0;

  let buttonLabel = "Book Slot";

  if (loading) {
    buttonLabel = "Booking...";
  } else if (disabled) {
    buttonLabel = "Slot full";
  } else if (!commodityId) {
    buttonLabel = "Select crop";
  } else if (
    estimatedQuantityQtl === null ||
    !Number.isFinite(estimatedQuantityQtl) ||
    estimatedQuantityQtl <= 0
  ) {
    buttonLabel = "Enter quantity";
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleBookSlot}
        disabled={buttonDisabled}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && (
          <Loader2
            size={16}
            className="animate-spin"
          />
        )}

        {buttonLabel}
      </button>

      {error && (
        <p className="max-w-[240px] text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}