"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Wheat,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type Booking = {
  id: string;
  token_number: number;
  status: string;
  booked_at: string;
  commodity_id: string | null;
  estimated_quantity_qtl: number | null;
  gate_pass_number: string | null;
  queue_position: number | null;
  current_stage: string | null;
  commodity: {
    id: string;
    name: string;
  } | null;
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

export default function MyBookingPage() {
  const supabase = createClient();

  const [booking, setBooking] =
    useState<Booking | null>(null);

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
          `${API_URL}/api/bookings/me`,
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
              "Unable to load your booking."
          );
          return;
        }

        setBooking(result.data);
      } catch (error) {
        console.error(
          "Load booking error:",
          error
        );

        setError(
          "Unable to connect to the booking service."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-48 rounded bg-gray-200" />
            <div className="h-64 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-xl font-bold text-red-700">
              Unable to Load Booking
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <Ticket
              className="mx-auto text-gray-400"
              size={42}
            />

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              No Active Booking
            </h1>

            <p className="mt-2 text-gray-600">
              You don't currently have an active
              procurement booking.
            </p>

            <Link
              href="/centres"
              className="mt-6 inline-flex rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Find a Procurement Centre
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
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime =
    booking.slot.start_time.slice(0, 5);

  const formattedEndTime =
    booking.slot.end_time.slice(0, 5);

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            KisanQueue
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            My Booking
          </h1>

          <p className="mt-2 text-gray-600">
            Your current procurement appointment.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[var(--color-primary)] px-6 py-6 text-white">
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

          <div className="space-y-6 p-6">
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
                  {centre.address}, {centre.district},{" "}
                  {centre.state} - {centre.pincode}
                </p>

                <p className="mt-1 text-xs font-medium text-gray-500">
                  Centre Code: {centre.centre_code}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <CalendarDays
                  size={20}
                  className="text-[var(--color-primary)]"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Date
                </p>

                <p className="font-semibold text-gray-900">
                  {formattedDate}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <Clock
                  size={20}
                  className="text-[var(--color-primary)]"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Time
                </p>

                <p className="font-semibold text-gray-900">
                  {formattedStartTime} -{" "}
                  {formattedEndTime}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Queue Position
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {booking.queue_position
                    ? `#${booking.queue_position}`
                    : "Not assigned"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <Wheat
                    size={16}
                    className="text-gray-500"
                  />

                  <p className="text-xs text-gray-500">
                    Crop
                  </p>
                </div>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {booking.commodity?.name ||
                    "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Current Stage
                </p>

                <p className="mt-1 text-xl font-bold capitalize text-gray-900">
                  {booking.current_stage ||
                    "Booking"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Estimated Quantity
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {booking.estimated_quantity_qtl
                    ? `${booking.estimated_quantity_qtl} Qtl`
                    : "Not provided"}
                </p>
              </div>
            </div>

            {booking.gate_pass_number && (
              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-xs font-medium text-green-700">
                  Gate Pass Number
                </p>

                <p className="mt-1 font-mono text-lg font-bold text-green-900">
                  {booking.gate_pass_number}
                </p>
              </div>
            )}

            <Link
              href={`/booking/${booking.id}`}
              className="block w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              View Full Booking Details
            </Link>

            <Link
              href="/centres"
              className="block w-full rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Find Another Centre
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}