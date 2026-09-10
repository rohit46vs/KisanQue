"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  Scale,
  Ticket,
  Users,
  Wheat,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

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
  } | null;
};

const stages = [
  {
    key: "booking",
    label: "Booking",
    description: "Slot booked",
    icon: Ticket,
  },
  {
    key: "gate",
    label: "Gate",
    description: "Gate verification",
    icon: MapPin,
  },
  {
    key: "weighbridge",
    label: "Weighbridge",
    description: "Quantity weighing",
    icon: Scale,
  },
  {
    key: "quality",
    label: "Quality",
    description: "Quality inspection",
    icon: CheckCircle2,
  },
  {
    key: "bagging",
    label: "Bagging",
    description: "Procurement packing",
    icon: PackageCheck,
  },
  {
    key: "payment",
    label: "Payment",
    description: "Payment processing",
    icon: Wheat,
  },
];

function getStageIndex(
  stage: string | null
) {
  const index = stages.findIndex(
    (item) => item.key === stage
  );

  return index >= 0 ? index : 0;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "booked":
      return "Booked";

    case "waiting":
      return "Waiting";

    case "called":
      return "Farmer Called";

    case "arrived":
      return "At Gate";

    case "inspected":
      return "Quality Inspection";

    case "accepted":
      return "Accepted";

    case "rejected":
      return "Rejected";

    case "payment":
      return "Payment Pending";

    case "completed":
      return "Completed";

    case "skipped":
      return "Skipped";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "waiting":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "called":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "arrived":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "inspected":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "accepted":
      return "bg-green-50 text-green-700 border-green-200";

    case "payment":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "completed":
      return "bg-green-100 text-green-800 border-green-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    case "skipped":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function formatDate(value: string) {
  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export default function MyQueuePage() {
  const [queues, setQueues] =
    useState<QueueData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    realtimeConnected,
    setRealtimeConnected,
  ] = useState(false);

  async function loadQueue(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const supabase = createClient();

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
        `${API_URL}/api/queue/my-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            "Unable to load your queue."
        );
        return;
      }

      const queueData = Array.isArray(
        result.data
      )
        ? result.data
        : result.data
          ? [result.data]
          : [];

      setQueues(queueData);
    } catch (error) {
      console.error(
        "Load queue error:",
        error
      );

      setError(
        "Unable to connect to the queue service."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("farmer-live-queues")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          loadQueue(true);
        }
      )
      .subscribe((status) => {
        console.log(
          "Farmer queue realtime:",
          status
        );

        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);
        } else if (
          status === "CLOSED" ||
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          setRealtimeConnected(false);
        }
      });

    const refreshInterval =
      window.setInterval(() => {
        loadQueue(true);
      }, 30000);

    return () => {
      window.clearInterval(
        refreshInterval
      );

      supabase.removeChannel(channel);

      setRealtimeConnected(false);
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-6 h-8 w-40 rounded bg-gray-200" />

          <div className="h-48 rounded-3xl bg-gray-200" />

          <div className="mt-5 h-48 rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle
              size={44}
              className="mx-auto text-red-400"
            />

            <h1 className="mt-4 text-2xl font-bold text-red-800">
              Unable to Load Queue
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

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

  if (queues.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/my-booking"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={18} />
            Back to My Bookings
          </Link>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <Ticket
              size={44}
              className="mx-auto text-gray-400"
            />

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              No Active Queue
            </h1>

            <p className="mt-2 text-gray-600">
              You don't currently have any active
              procurement bookings in the queue.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/my-booking"
                className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                View My Bookings
              </Link>

              <Link
                href="/centres"
                className="inline-flex justify-center rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
              >
                Book a Slot
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              KisanQueue
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              My Live Queues
            </h1>

            <p className="mt-2 text-gray-600">
              Track all your active procurement bookings
              in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadQueue(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Summary */}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">
              Active Queues
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {queues.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">
              Total People Ahead
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {queues.reduce(
                (
                  total,
                  queue
                ) =>
                  total +
                  queue.people_ahead,
                0
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">
              Live Status
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  realtimeConnected
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />

              <p className="text-sm font-semibold text-gray-900">
                {realtimeConnected
                  ? "Connected"
                  : "Reconnecting"}
              </p>
            </div>
          </div>
        </div>

        {/* Realtime Status */}

        <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                realtimeConnected
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />

            <p className="text-xs font-medium text-gray-600">
              {realtimeConnected
                ? "Live updates connected"
                : "Checking live connection..."}
            </p>
          </div>

          <p className="text-xs text-gray-400">
            Auto-refresh every 30 seconds
          </p>
        </div>

        {/* Queue Cards */}

        <div className="space-y-6">
          {queues.map((queue) => {
            const centre =
              queue.slot?.centre;

            const currentStageIndex =
              getStageIndex(
                queue.current_stage
              );

            const isCompleted =
              queue.status ===
              "completed";

            const isRejected =
              queue.status ===
              "rejected";

            const formattedDate =
              queue.slot
                ? formatDate(
                    queue.slot.slot_date
                  )
                : "Date unavailable";

            const startTime =
              queue.slot
                ? formatTime(
                    queue.slot.start_time
                  )
                : "—";

            const endTime =
              queue.slot
                ? formatTime(
                    queue.slot.end_time
                  )
                : "—";

            return (
              <div
                key={queue.booking_id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Token Header */}

                <div className="bg-[var(--color-primary)] px-6 py-7 text-white">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm opacity-90">
                        Your Token
                      </p>

                      <p className="mt-1 text-5xl font-bold">
                        #{queue.token_number}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/15 px-5 py-4 text-center">
                      <p className="text-xs opacity-90">
                        Queue Position
                      </p>

                      <p className="text-3xl font-bold">
                        {queue.queue_position
                          ? `#${queue.queue_position}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 inline-flex rounded-full border px-4 py-1.5 text-sm font-medium ${getStatusClass(
                      queue.status
                    )}`}
                  >
                    {getStatusLabel(
                      queue.status
                    )}
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* People Ahead */}

                  {!isCompleted &&
                    !isRejected && (
                      <div className="rounded-2xl bg-green-50 p-6 text-center">
                        <Users
                          size={32}
                          className="mx-auto text-[var(--color-primary)]"
                        />

                        <p className="mt-3 text-sm text-gray-600">
                          People Ahead of You
                        </p>

                        <p className="mt-1 text-5xl font-bold text-gray-900">
                          {
                            queue.people_ahead
                          }
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          {queue.people_ahead ===
                          0
                            ? "You're first in line."
                            : queue.people_ahead ===
                              1
                            ? "1 farmer is ahead of you."
                            : `${queue.people_ahead} farmers are ahead of you.`}
                        </p>
                      </div>
                    )}

                  {/* Current Stage */}

                  <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2">
                        <CheckCircle2
                          size={22}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-green-700">
                          Current Stage
                        </p>

                        <p className="mt-0.5 text-2xl font-bold capitalize text-green-900">
                          {stages[
                            currentStageIndex
                          ]?.label ||
                            "Booking"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Procurement Journey */}

                  <section>
                    <div className="mb-4">
                      <h2 className="font-semibold text-gray-900">
                        Procurement Journey
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Follow your booking from arrival
                        through payment.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {stages.map(
                        (
                          stage,
                          index
                        ) => {
                          const Icon =
                            stage.icon;

                          const completed =
                            isCompleted ||
                            index <
                              currentStageIndex;

                          const active =
                            !isCompleted &&
                            index ===
                              currentStageIndex;

                          const pending =
                            !completed &&
                            !active;

                          return (
                            <div
                              key={
                                stage.key
                              }
                              className={`flex items-center gap-4 rounded-2xl border p-4 ${
                                active
                                  ? "border-green-200 bg-green-50"
                                  : completed
                                  ? "border-gray-200 bg-white"
                                  : "border-gray-100 bg-gray-50"
                              }`}
                            >
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                  completed
                                    ? "bg-green-100 text-green-700"
                                    : active
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-400"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle2
                                    size={
                                      22
                                    }
                                  />
                                ) : (
                                  <Icon
                                    size={
                                      active
                                        ? 22
                                        : 20
                                    }
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-semibold ${
                                    active
                                      ? "text-green-900"
                                      : pending
                                      ? "text-gray-500"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {
                                    stage.label
                                  }
                                </p>

                                <p
                                  className={`mt-0.5 text-xs ${
                                    active
                                      ? "text-green-700"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {active
                                    ? "Currently being processed"
                                    : stage.description}
                                </p>
                              </div>

                              <div>
                                {completed ? (
                                  <CheckCircle2
                                    size={
                                      20
                                    }
                                    className="text-green-600"
                                  />
                                ) : active ? (
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                                    <Loader2
                                      size={
                                        14
                                      }
                                      className="animate-spin"
                                    />
                                    Active
                                  </div>
                                ) : (
                                  <Clock
                                    size={
                                      18
                                    }
                                    className="text-gray-300"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </section>

                  {/* Completed */}

                  {isCompleted && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />

                        <div>
                          <p className="font-semibold text-green-900">
                            Procurement Completed
                          </p>

                          <p className="mt-1 text-sm text-green-700">
                            Your procurement journey has
                            been completed successfully.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejected */}

                  {isRejected && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                      <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-700" />

                        <div>
                          <p className="font-semibold text-red-900">
                            Quality Rejected
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            Your procurement has been
                            marked as rejected during
                            quality inspection.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visit Details */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <CalendarDays
                        size={20}
                        className="text-[var(--color-primary)]"
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        Visit Date
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
                        Time Slot
                      </p>

                      <p className="font-semibold text-gray-900">
                        {startTime} –{" "}
                        {endTime}
                      </p>
                    </div>
                  </div>

                  {/* Centre */}

                  {centre && (
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

                        <p className="font-semibold text-gray-900">
                          {centre.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {centre.address},{" "}
                          {centre.district},{" "}
                          {centre.state}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Centre Code:{" "}
                          {
                            centre.centre_code
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Booking Information */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2">
                        <Wheat
                          size={17}
                          className="text-gray-500"
                        />

                        <p className="text-xs text-gray-500">
                          Estimated Quantity
                        </p>
                      </div>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {queue.estimated_quantity_qtl
                          ? `${queue.estimated_quantity_qtl} Qtl`
                          : "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">
                        Gate Pass
                      </p>

                      <p className="mt-1 break-all font-mono text-sm font-bold text-gray-900">
                        {queue.gate_pass_number ||
                          "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/booking/${queue.booking_id}`}
                      className="flex-1 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                    >
                      Booking Details
                    </Link>

                    <Link
                      href="/my-booking"
                      className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      My Bookings
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Information */}

        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                realtimeConnected
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />

            <div>
              <p className="text-sm font-medium text-gray-700">
                Live queue tracking
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {realtimeConnected
                  ? "Your queue positions and procurement stages will update automatically when the centre processes your bookings."
                  : "We're reconnecting to live queue updates. You can also use Refresh to get the latest status."}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          Your queue status is controlled by the
          procurement centre.
        </p>
      </div>
    </main>
  );
}