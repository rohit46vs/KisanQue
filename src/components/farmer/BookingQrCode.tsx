"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, ShieldCheck } from "lucide-react";

type BookingQrCodeProps = {
  bookingId: string;
  qrToken: string | null;
  tokenNumber: number;
};

export default function BookingQrCode({
  bookingId,
  qrToken,
  tokenNumber,
}: BookingQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generateQrCode() {
      try {
        setError(null);
        setQrDataUrl(null);

        if (!bookingId) {
          setError(
            "Booking information is unavailable."
          );
          return;
        }

        if (!qrToken) {
          setError(
            "QR verification token is unavailable."
          );
          return;
        }

        /*
         * The QR contains only a verification payload.
         *
         * Never place:
         * - Aadhaar number
         * - phone number
         * - address
         * - payment information
         * - farmer profile information
         *
         * inside the QR code.
         */

        const payload = JSON.stringify({
          type: "KISANQUEUE_BOOKING",
          version: 1,
          booking_id: bookingId,
          token: qrToken,
          token_number: tokenNumber,
        });

        const dataUrl =
          await QRCode.toDataURL(
            payload,
            {
              errorCorrectionLevel: "M",
              margin: 2,
              width: 320,
            }
          );

        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error(
          "QR generation error:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to generate the QR code."
          );
        }
      }
    }

    generateQrCode();

    return () => {
      cancelled = true;
    };
  }, [
    bookingId,
    qrToken,
    tokenNumber,
  ]);

  return (
    <section className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <ShieldCheck
            size={24}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h2 className="mt-3 text-xl font-bold text-gray-900">
          Digital Procurement Pass
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Show this QR code at the procurement
          centre gate.
        </p>
      </div>

      <div className="mt-6 flex min-h-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-5">
        {qrDataUrl ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <img
              src={qrDataUrl}
              alt={`KisanQueue digital procurement pass for token ${tokenNumber}`}
              width={320}
              height={320}
              className="h-auto w-full max-w-[320px]"
            />
          </div>
        ) : error ? (
          <div className="max-w-xs text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2
              size={28}
              className="animate-spin"
            />

            <p className="text-sm">
              Generating secure QR code...
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-green-50 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
          Token Number
        </p>

        <p className="mt-1 text-3xl font-bold text-green-900">
          #{tokenNumber}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-center text-xs leading-5 text-gray-500">
          This QR code contains a booking verification
          token only. Do not share screenshots publicly.
        </p>
      </div>
    </section>
  );
}