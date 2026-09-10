"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Ticket,
  Wheat,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type PaymentStatus =
  | "pending"
  | "processing"
  | "credited"
  | "failed";

type ProcurementTransaction = {
  id: string;
  booking_id: string;
  crop_name: string;
  quantity_kg: number;
  rate_per_kg: number;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  status: string;
  receipt_number: string | null;
  j_form_number: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_initiated_at: string | null;
  payment_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type Booking = {
  id: string;
  token_number: number;
  status: string;
  booked_at: string;
  commodity_id: string | null;
  estimated_quantity_qtl: number | null;
  actual_quantity_qtl: number | null;
  gate_pass_number: string | null;
  queue_position: number | null;
  current_stage: string | null;

  commodity: {
    id: string;
    name: string;
    code?: string | null;
    category?: string | null;
    storage_requirement?: string | null;
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
  } | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "booked":
      return "Booked";

    case "waiting":
      return "Waiting";

    case "called":
      return "Called";

    case "arrived":
      return "At Centre";

    case "inspected":
      return "Quality Inspection";

    case "accepted":
      return "Accepted";

    case "payment":
      return "Payment Pending";

    case "completed":
      return "Completed";

    case "rejected":
      return "Rejected";

    case "skipped":
      return "Skipped";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "waiting":
      return "bg-amber-50 text-amber-700";

    case "called":
      return "bg-blue-50 text-blue-700";

    case "arrived":
      return "bg-purple-50 text-purple-700";

    case "inspected":
      return "bg-indigo-50 text-indigo-700";

    case "accepted":
      return "bg-green-50 text-green-700";

    case "payment":
      return "bg-emerald-50 text-emerald-700";

    case "completed":
      return "bg-green-100 text-green-800";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "skipped":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPaymentLabel(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "Payment Pending";

    case "processing":
      return "Payment Processing";

    case "credited":
      return "Payment Credited";

    case "failed":
      return "Payment Failed";

    default:
      return status;
  }
}

function getPaymentClass(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "processing":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "credited":
      return "border-green-200 bg-green-50 text-green-700";

    case "failed":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function formatSlotDate(value: string) {
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

function isActiveBooking(status: string) {
  return [
    "booked",
    "waiting",
    "called",
    "arrived",
    "inspected",
    "accepted",
    "payment",
  ].includes(status);
}

export default function MyBookingPage() {
  const supabase = createClient();

  const [bookings, setBookings] = useState<Booking[]>(
    []
  );

  const [
    transactions,
    setTransactions,
  ] = useState<
    Record<string, ProcurementTransaction>
  >({});

  const [loading, setLoading] =
    useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function loadBookings() {
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
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.error ||
            "Unable to load your bookings."
        );
        return;
      }

      const bookingData = Array.isArray(
        result.data
      )
        ? result.data
        : result.data
          ? [result.data]
          : [];

      setBookings(bookingData);

      await loadTransactions(
        bookingData
          .map(
            (booking: Booking) =>
              booking.id
          )
          .filter(Boolean)
      );
    } catch (error) {
      console.error(
        "Load bookings error:",
        error
      );

      setError(
        "Unable to connect to the booking service."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions(
    bookingIds: string[]
  ) {
    if (bookingIds.length === 0) {
      setTransactions({});
      return;
    }

    try {
      setPaymentLoading(true);

      const {
        data,
        error: queryError,
      } = await supabase
        .from("procurement_transactions")
        .select(
          `
          id,
          booking_id,
          crop_name,
          quantity_kg,
          rate_per_kg,
          gross_amount,
          deductions,
          net_amount,
          status,
          receipt_number,
          j_form_number,
          payment_status,
          payment_reference,
          payment_initiated_at,
          payment_completed_at,
          created_at,
          updated_at
          `
        )
        .in(
          "booking_id",
          bookingIds
        );

      if (queryError) {
        console.error(
          "Load procurement transactions error:",
          queryError
        );

        return;
      }

      const transactionMap: Record<
        string,
        ProcurementTransaction
      > = {};

      for (const item of data ?? []) {
        const transaction =
          item as ProcurementTransaction;

        transactionMap[
          transaction.booking_id
        ] = transaction;
      }

      setTransactions(transactionMap);
    } finally {
      setPaymentLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const bookingChannel =
      supabase
        .channel("my-bookings-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
          },
          () => {
            loadBookings();
          }
        )
        .subscribe();

    const paymentChannel =
      supabase
        .channel("my-payments-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "procurement_transactions",
          },
          () => {
            loadBookings();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        bookingChannel
      );

      supabase.removeChannel(
        paymentChannel
      );
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-48 rounded bg-gray-200" />
            <div className="h-48 rounded-2xl bg-gray-200" />
            <div className="mt-5 h-48 rounded-2xl bg-gray-200" />
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
              Unable to Load Bookings
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadBookings}
              className="mt-5 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (bookings.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <Ticket
              className="mx-auto text-gray-400"
              size={42}
            />

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              No Bookings Yet
            </h1>

            <p className="mt-2 text-gray-600">
              You don't currently have any
              procurement bookings.
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

  const activeBookings =
    bookings.filter((booking) =>
      isActiveBooking(
        booking.status
      )
    ).length;

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            KisanQueue
          </p>

          <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Bookings
              </h1>

              <p className="mt-2 text-gray-600">
                View and track all your procurement
                appointments.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700">
                {bookings.length}{" "}
                {bookings.length === 1
                  ? "booking"
                  : "bookings"}
              </span>

              {activeBookings > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                  {activeBookings} active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Booking List */}

        <div className="space-y-6">
          {bookings.map((booking) => {
            const centre =
              booking.slot?.centre;

            const transaction =
              transactions[
                booking.id
              ];

            const formattedDate =
              booking.slot
                ? formatSlotDate(
                    booking.slot.slot_date
                  )
                : "Date unavailable";

            const formattedStartTime =
              booking.slot
                ? formatTime(
                    booking.slot.start_time
                  )
                : "—";

            const formattedEndTime =
              booking.slot
                ? formatTime(
                    booking.slot.end_time
                  )
                : "—";

            return (
              <section
                key={booking.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Token Header */}

                <div className="bg-[var(--color-primary)] px-6 py-6 text-white">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm opacity-90">
                        Your Token
                      </p>

                      <p className="mt-1 text-5xl font-bold">
                        #
                        {
                          booking.token_number
                        }
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span
                        className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(
                          booking.status
                        )}
                      </span>

                      <p className="text-xs opacity-80">
                        Booking ID:{" "}
                        {booking.id.slice(
                          0,
                          8
                        )}
                        ...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
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

                        <h2 className="font-semibold text-gray-900">
                          {centre.name}
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                          {centre.address},{" "}
                          {centre.district},{" "}
                          {centre.state} -{" "}
                          {centre.pincode}
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-500">
                          Centre Code:{" "}
                          {
                            centre.centre_code
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Date / Time */}

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
                        {
                          formattedStartTime
                        }{" "}
                        -{" "}
                        {
                          formattedEndTime
                        }
                      </p>
                    </div>
                  </div>

                  {/* Booking Information */}

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
                        {booking
                          .commodity
                          ?.name ||
                          "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">
                        Current Stage
                      </p>

                      <p className="mt-1 text-xl font-bold capitalize text-gray-900">
                        {booking
                          .current_stage ||
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

                  {/* Actual Quantity */}

                  {booking.actual_quantity_qtl !==
                    null &&
                    booking.actual_quantity_qtl !==
                      undefined && (
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                        <p className="text-xs font-medium text-green-700">
                          Final Quantity
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-900">
                          {
                            booking.actual_quantity_qtl
                          }{" "}
                          Qtl
                        </p>
                      </div>
                    )}

                  {/* Gate Pass */}

                  {booking.gate_pass_number && (
                    <div className="rounded-2xl bg-green-50 p-5">
                      <p className="text-xs font-medium text-green-700">
                        Gate Pass Number
                      </p>

                      <p className="mt-1 font-mono text-lg font-bold text-green-900">
                        {
                          booking.gate_pass_number
                        }
                      </p>
                    </div>
                  )}

                  {/* Procurement & Payment */}

                  {paymentLoading &&
                  !transaction ? (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading payment details...
                      </div>
                    </div>
                  ) : transaction ? (
                    <section className="overflow-hidden rounded-2xl border border-green-200">
                      <div className="border-b border-green-100 bg-green-50 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <IndianRupee
                            size={20}
                            className="text-green-700"
                          />

                          <div>
                            <h2 className="font-semibold text-green-900">
                              Procurement & Payment
                            </h2>

                            <p className="mt-0.5 text-xs text-green-700">
                              Final procurement and
                              payment details
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 p-5">
                        {/* Financial Summary */}

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-500">
                              Final Quantity
                            </p>

                            <p className="mt-1 text-lg font-bold text-gray-900">
                              {Number(
                                transaction.quantity_kg
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              kg
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-500">
                              Procurement Rate
                            </p>

                            <p className="mt-1 text-lg font-bold text-gray-900">
                              {formatCurrency(
                                Number(
                                  transaction.rate_per_kg
                                )
                              )}{" "}
                              / kg
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-500">
                              Gross Amount
                            </p>

                            <p className="mt-1 text-lg font-bold text-gray-900">
                              {formatCurrency(
                                Number(
                                  transaction.gross_amount
                                )
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-500">
                              Deductions
                            </p>

                            <p className="mt-1 text-lg font-bold text-gray-900">
                              {formatCurrency(
                                Number(
                                  transaction.deductions
                                )
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Net Amount */}

                        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                          <p className="text-xs font-medium text-green-700">
                            Net Procurement Amount
                          </p>

                          <p className="mt-1 text-3xl font-bold text-green-900">
                            {formatCurrency(
                              Number(
                                transaction.net_amount
                              )
                            )}
                          </p>
                        </div>

                        {/* Payment Status */}

                        <div
                          className={`rounded-2xl border p-5 ${getPaymentClass(
                            transaction.payment_status
                          )}`}
                        >
                          <div className="flex items-start gap-3">
                            {transaction.payment_status ===
                            "credited" ? (
                              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
                            ) : transaction.payment_status ===
                              "failed" ? (
                              <XCircle className="mt-0.5 h-6 w-6 shrink-0" />
                            ) : transaction.payment_status ===
                              "processing" ? (
                              <Loader2 className="mt-0.5 h-6 w-6 shrink-0 animate-spin" />
                            ) : (
                              <Clock className="mt-0.5 h-6 w-6 shrink-0" />
                            )}

                            <div>
                              <p className="font-semibold">
                                {getPaymentLabel(
                                  transaction.payment_status
                                )}
                              </p>

                              <p className="mt-1 text-sm">
                                {transaction.payment_status ===
                                "pending"
                                  ? "Your procurement is complete and payment is waiting to be processed."
                                  : transaction.payment_status ===
                                    "processing"
                                  ? "Your payment is currently being processed through the PFMS/DBT system."
                                  : transaction.payment_status ===
                                    "credited"
                                  ? "Your procurement payment has been credited successfully."
                                  : "Your payment could not be processed. Please contact the procurement centre."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details */}

                        <div className="grid gap-4 sm:grid-cols-2">
                          {transaction.payment_reference && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                              <p className="text-xs text-blue-600">
                                Payment Reference
                              </p>

                              <p className="mt-1 break-all font-mono text-sm font-semibold text-blue-900">
                                {
                                  transaction.payment_reference
                                }
                              </p>
                            </div>
                          )}

                          {transaction.payment_initiated_at && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                              <p className="text-xs text-blue-600">
                                Payment Initiated
                              </p>

                              <p className="mt-1 text-sm font-semibold text-blue-900">
                                {formatDateTime(
                                  transaction.payment_initiated_at
                                )}
                              </p>
                            </div>
                          )}

                          {transaction.payment_completed_at && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                              <p className="text-xs text-green-600">
                                Payment Credited
                              </p>

                              <p className="mt-1 text-sm font-semibold text-green-900">
                                {formatDateTime(
                                  transaction.payment_completed_at
                                )}
                              </p>
                            </div>
                          )}

                          {transaction.receipt_number && (
                            <div className="rounded-xl border border-gray-200 p-4">
                              <p className="text-xs text-gray-500">
                                Receipt Number
                              </p>

                              <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
                                {
                                  transaction.receipt_number
                                }
                              </p>
                            </div>
                          )}

                          {transaction.j_form_number && (
                            <div className="rounded-xl border border-gray-200 p-4">
                              <p className="text-xs text-gray-500">
                                J-Form Number
                              </p>

                              <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
                                {
                                  transaction.j_form_number
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {/* Booking Time */}

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Booking Created
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDateTime(
                        booking.booked_at
                      )}
                    </p>
                  </div>

                  {/* Actions */}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/booking/${booking.id}`}
                      className="block w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                    >
                      View Full Booking Details
                    </Link>

                    {isActiveBooking(
                      booking.status
                    ) && (
                      <Link
                        href={`/my-queue?booking=${booking.id}`}
                        className="block w-full rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-center text-sm font-semibold text-green-700 transition hover:bg-green-100"
                      >
                        View Queue
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Action */}

        <div className="mt-6">
          <Link
            href="/centres"
            className="block w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Find Another Centre
          </Link>
        </div>
      </div>
    </main>
  );
}