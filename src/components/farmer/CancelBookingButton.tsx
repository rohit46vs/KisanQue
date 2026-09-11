"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CancelBookingButtonProps = {
  bookingId: string;
  onCancelled?: () => void;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function CancelBookingButton({
  bookingId,
  onCancelled,
}: CancelBookingButtonProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  function openConfirmation() {
    if (loading) {
      return;
    }

    setError(null);
    setShowConfirm(true);
  }

  function closeConfirmation() {
    if (loading) {
      return;
    }

    setShowConfirm(false);
    setError(null);
  }

  async function handleCancel() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        setError(
          "Your session has expired. Please log in again."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            "Unable to cancel this booking."
        );
        setLoading(false);
        return;
      }

      setShowConfirm(false);
      setLoading(false);

      onCancelled?.();
    } catch (error) {
      console.error(
        "Cancel booking request failed:",
        error
      );

      setError(
        "Unable to connect to the booking service. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openConfirmation}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X size={16} />

        Cancel Booking
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2
                  id="cancel-booking-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Cancel this booking?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your slot booking will be cancelled and
                  your place in the queue will be released.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                You can only cancel before processing
                begins.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Once your booking has been called or you
                have entered the procurement process, it
                cannot be cancelled from the farmer app.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? "Cancelling..."
                  : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}