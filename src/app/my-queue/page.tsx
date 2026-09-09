"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type QueueData = {
  booking_id: string;
  token_number: number;
  status: string;
  queue_position: number | null;
  people_ahead: number;
  current_stage: string | null;
  estimated_quantity_qtl: number | null;
  booked_at: string;
  gate_pass_number: string | null;
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
    };
  };
};

export default function MyQueuePage() {
  const supabase = createClient();

  const [queue, setQueue] = useState<QueueData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function loadQueue(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/queue/my-status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          setQueue(null);
          return;
        }

        setError(result.error || "Unable to load your queue.");
        return;
      }

      setQueue(result.data);
    } catch (error) {
      console.error("Load queue error:", error);

      setError("Unable to connect to the queue service.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

 useEffect(() => {
  if (!queue?.booking_id) {
    return;
  }

  const channel = supabase
    .channel(`booking-${queue.booking_id}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "bookings",
        filter: `id=eq.${queue.booking_id}`,
      },
      (payload) => {
        const updatedBooking =
          payload.new as Partial<QueueData> & {
            id: string;
          };

        console.log(
          "Queue update received:",
          payload
        );

        setQueue((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,

            token_number:
              updatedBooking.token_number !==
              undefined
                ? updatedBooking.token_number
                : current.token_number,

            status:
              updatedBooking.status !== undefined
                ? updatedBooking.status
                : current.status,

            queue_position:
              updatedBooking.queue_position !==
              undefined
                ? updatedBooking.queue_position
                : current.queue_position,

            current_stage:
              updatedBooking.current_stage !==
              undefined
                ? updatedBooking.current_stage
                : current.current_stage,

            estimated_quantity_qtl:
              updatedBooking.estimated_quantity_qtl !==
              undefined
                ? updatedBooking.estimated_quantity_qtl
                : current.estimated_quantity_qtl,

            gate_pass_number:
              updatedBooking.gate_pass_number !==
              undefined
                ? updatedBooking.gate_pass_number
                : current.gate_pass_number,
          };
        });
      }
    )
    .subscribe((status) => {
      console.log(
        "Queue realtime subscription:",
        status
      );
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [queue?.booking_id, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mb-6 h-8 w-40 rounded bg-gray-200" />
          <div className="h-96 rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <Ticket size={44} className="mx-auto text-red-400" />

            <h1 className="mt-4 text-2xl font-bold text-red-800">
              Unable to Load Queue
            </h1>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => loadQueue()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!queue) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/my-booking"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <ArrowLeft size={18} />
            Back to My Booking
          </Link>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <Ticket size={44} className="mx-auto text-gray-400" />

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              No Active Queue
            </h1>

            <p className="mt-2 text-gray-600">
              You don't currently have an active procurement booking.
            </p>

            <Link
              href="/centres"
              className="mt-6 inline-flex rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Book a Slot
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const centre = queue.slot.centre;

  const formattedDate = new Date(
    `${queue.slot.slot_date}T00:00:00`,
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startTime = queue.slot.start_time.slice(0, 5);

  const endTime = queue.slot.end_time.slice(0, 5);

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              KisanQueue
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Live Queue
            </h1>

            <p className="mt-2 text-gray-600">
              Track your position at the procurement centre.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadQueue(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-[var(--color-primary)] px-6 py-7 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm opacity-90">Your Token</p>

                <p className="mt-1 text-5xl font-bold">#{queue.token_number}</p>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-4 text-center">
                <p className="text-xs opacity-90">Queue Position</p>

                <p className="text-3xl font-bold">
                  {queue.queue_position ? `#${queue.queue_position}` : "—"}
                </p>
              </div>
            </div>

            <div className="mt-5 inline-flex rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium capitalize">
              {queue.status}
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="rounded-2xl bg-green-50 p-6 text-center">
              <Users
                size={32}
                className="mx-auto text-[var(--color-primary)]"
              />

              <p className="mt-3 text-sm text-gray-600">People Ahead of You</p>

              <p className="mt-1 text-5xl font-bold text-gray-900">
                {queue.people_ahead}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {queue.people_ahead === 0
                  ? "You're first in line."
                  : "Farmers are ahead of you."}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Current Stage</p>

              <p className="mt-1 text-2xl font-bold capitalize text-gray-900">
                {queue.current_stage || "Booking"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <CalendarDays
                  size={20}
                  className="text-[var(--color-primary)]"
                />

                <p className="mt-2 text-xs text-gray-500">Visit Date</p>

                <p className="font-semibold text-gray-900">{formattedDate}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <Clock size={20} className="text-[var(--color-primary)]" />

                <p className="mt-2 text-xs text-gray-500">Time Slot</p>

                <p className="font-semibold text-gray-900">
                  {startTime} – {endTime}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="rounded-xl bg-green-50 p-3">
                <MapPin size={22} className="text-[var(--color-primary)]" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Procurement Centre</p>

                <p className="font-semibold text-gray-900">{centre.name}</p>

                <p className="mt-1 text-sm text-gray-600">
                  {centre.address}, {centre.district}, {centre.state}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Centre Code: {centre.centre_code}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Estimated Quantity</p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {queue.estimated_quantity_qtl
                    ? `${queue.estimated_quantity_qtl} Qtl`
                    : "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Gate Pass</p>

                <p className="mt-1 break-all font-mono text-sm font-bold text-gray-900">
                  {queue.gate_pass_number || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/booking/${queue.booking_id}`}
                className="flex-1 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Booking Details
              </Link>

              <Link
                href="/centres"
                className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Centres
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Queue updates will become real-time in the next stage.
        </p>
      </div>
    </main>
  );
}
