"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  QrCode,
  Scale,
  Ticket,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type Booking = {
  id: string;
  token_number: number;
  status: string;
  booked_at: string;
  estimated_quantity_qtl: number | null;
  qr_token: string | null;
  gate_pass_number: string | null;
  queue_position: number | null;
  current_stage: string | null;
  slot: {
    id: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    centre: {
      id: string;
      centre_code: string;
      name: string;
      address: string;
      district: string;
      state: string;
      pincode: string;
    };
  };
};

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const supabase = createClient();

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [qrCode, setQrCode] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError(null);

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
          return;
        }

        const response = await fetch(
          `${API_URL}/api/bookings/${bookingId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(
            result.error ||
              "Unable to load booking details."
          );
          return;
        }

        const bookingData =
          result.data as Booking;

        setBooking(bookingData);

        const centre =
          bookingData.slot.centre;

        const qrData = JSON.stringify({
          booking_id: bookingData.id,
          gate_pass_number:
            bookingData.gate_pass_number,
          token_number:
            bookingData.token_number,
          centre_code:
            centre.centre_code,
        });

        const generatedQr =
          await QRCode.toDataURL(qrData, {
            width: 280,
            margin: 2,
            errorCorrectionLevel: "M",
          });

        setQrCode(generatedQr);
      } catch (error) {
        console.error(
          "Load booking details error:",
          error
        );

        setError(
          "Unable to connect to the booking service."
        );
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mb-6 h-6 w-32 rounded bg-gray-200" />
          <div className="h-[700px] rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <Ticket
              size={44}
              className="mx-auto text-red-400"
            />

            <h1 className="mt-4 text-2xl font-bold text-red-800">
              Booking Not Found
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error ||
                "We couldn't find this booking."}
            </p>

            <Link
              href="/my-booking"
              className="mt-6 inline-flex rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Back to My Booking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const centre = booking.slot.centre;

  const formattedDate = new Date(
    `${booking.slot.slot_date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime =
    booking.slot.start_time.slice(0, 5);

  const formattedEndTime =
    booking.slot.end_time.slice(0, 5);

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/my-booking"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={18} />
          Back to My Booking
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[var(--color-primary)] px-6 py-7 text-white">
            <p className="text-sm opacity-90">
              Your Token
            </p>

            <p className="mt-1 text-5xl font-bold">
              #{booking.token_number}
            </p>

            <div className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium capitalize">
              {booking.status}
            </div>
          </div>

          <div className="space-y-7 p-6">
            {qrCode && (
              <div className="rounded-2xl border border-gray-200 p-6 text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <QrCode
                    size={20}
                    className="text-[var(--color-primary)]"
                  />

                  <h2 className="font-semibold text-gray-900">
                    Gate Verification QR
                  </h2>
                </div>

                <img
                  src={qrCode}
                  alt="Booking verification QR code"
                  className="mx-auto h-[280px] w-[280px]"
                />

                <p className="mt-4 text-xs text-gray-500">
                  Show this QR code at the procurement
                  centre gate.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <div className="rounded-xl bg-green-50 p-3">
                <MapPin
                  size={22}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Procurement Centre
                </p>

                <h2 className="font-semibold text-gray-900">
                  {centre.name}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {centre.address},{" "}
                  {centre.district},{" "}
                  {centre.state} - {centre.pincode}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Centre Code:{" "}
                  {centre.centre_code}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="rounded-xl bg-green-50 p-3">
                  <CalendarDays
                    size={22}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Visit Date
                  </p>

                  <p className="font-semibold text-gray-900">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="rounded-xl bg-green-50 p-3">
                  <Clock
                    size={22}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Time Slot
                  </p>

                  <p className="font-semibold text-gray-900">
                    {formattedStartTime} –{" "}
                    {formattedEndTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <Users
                    size={18}
                    className="text-gray-500"
                  />

                  <p className="text-sm text-gray-500">
                    Queue Position
                  </p>
                </div>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {booking.queue_position
                    ? `#${booking.queue_position}`
                    : "Not assigned"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <Scale
                    size={18}
                    className="text-gray-500"
                  />

                  <p className="text-sm text-gray-500">
                    Estimated Quantity
                  </p>
                </div>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {booking.estimated_quantity_qtl
                    ? `${booking.estimated_quantity_qtl} Qtl`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-medium text-green-700">
                Current Stage
              </p>

              <p className="mt-1 text-xl font-bold capitalize text-green-900">
                {booking.current_stage ||
                  "Booking"}
              </p>
            </div>

            {booking.gate_pass_number && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-medium text-gray-500">
                  Gate Pass Number
                </p>

                <p className="mt-1 font-mono text-lg font-bold text-gray-900">
                  {booking.gate_pass_number}
                </p>
              </div>
            )}

            <div className="flex gap-3 rounded-2xl bg-gray-50 p-4">
              <Ticket
                size={20}
                className="mt-0.5 text-gray-500"
              />

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Keep this booking information
                  available when you visit the
                  procurement centre.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your token and QR code will be used
                  for gate verification.
                </p>
              </div>
            </div>

            <Link
              href="/my-queue"
              className="block w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              View Live Queue
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}