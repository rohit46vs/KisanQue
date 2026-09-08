"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type BookSlotButtonProps = {
  slotId: string;
  disabled?: boolean;
};

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
      const { data, error: bookingError } =
        await supabase.rpc("book_slot", {
          p_slot_id: slotId,
        });

      if (bookingError) {
        console.error(
          "Booking error:",
          bookingError.message
        );

        setError(
          bookingError.message ||
            "Unable to book this slot."
        );

        setLoading(false);
        return;
      }

      // Supabase can return the result as an object
      // or as the first item of an array.
      const booking = Array.isArray(data)
        ? data[0]
        : data;

      if (!booking?.id) {
        console.error(
          "Unexpected booking response:",
          data
        );

        setError(
          "Booking was created, but the booking details could not be loaded."
        );

        setLoading(false);
        return;
      }

      // Go to booking confirmation page
      router.push(
        `/booking/${booking.id}`
      );
    } catch (error) {
      console.error(
        "Unexpected booking error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
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