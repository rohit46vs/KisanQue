"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type BookSlotButtonProps = {
  slotId: string;
  disabled?: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function BookSlotButton({
  slotId,
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

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleBookSlot}
        disabled={disabled || loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && (
          <Loader2
            size={16}
            className="animate-spin"
          />
        )}

        {loading
          ? "Booking..."
          : disabled
            ? "Slot full"
            : "Book Slot"}
      </button>

      {error && (
        <p className="max-w-[220px] text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
