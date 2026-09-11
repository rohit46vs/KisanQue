"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Scale,
  Ticket,
  Users,
  Wheat,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BookingQrCode from "@/components/farmer/BookingQrCode";
import CancelBookingButton from "@/components/farmer/CancelBookingButton";

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
  qr_token: string | null;
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
    } | null;
  } | null;
};

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
  payment_status:
    | "pending"
    | "processing"
    | "credited"
    | "failed";
  payment_reference: string | null;
  payment_initiated_at: string | null;
  payment_completed_at: string | null;
  created_at: string;
  updated_at: string;
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

function getPaymentLabel(
  status: ProcurementTransaction["payment_status"]
) {
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

function getPaymentClass(
  status: ProcurementTransaction["payment_status"]
) {
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

function getBookingStatusClass(status: string) {
  switch (status) {
    case "booked":
      return "bg-blue-50 text-blue-700";

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

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getBookingStatusLabel(status: string) {
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

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
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

function isCancellableBooking(status: string) {
  return (
    status === "booked" ||
    status === "waiting"
  );
}

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const supabase = createClient();

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [transaction, setTransaction] =
    useState<ProcurementTransaction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [paymentError, setPaymentError] =
    useState<string | null>(null);

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
          cache: "no-store",
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

  async function loadTransaction() {
    try {
      setPaymentLoading(true);
      setPaymentError(null);

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
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      setTransaction(
        data as ProcurementTransaction | null
      );
    } catch (error) {
      console.error(
        "Load procurement transaction error:",
        error
      );

      setPaymentError(
        "Procurement payment details are not available yet."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    loadBooking();
    loadTransaction();

    const bookingChannel =
      supabase
        .channel(
          `farmer-booking-${bookingId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `id=eq.${bookingId}`,
          },
          () => {
            loadBooking();
            loadTransaction();
          }
        )
        .subscribe();

    const paymentChannel =
      supabase
        .channel(
          `farmer-payment-${bookingId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "procurement_transactions",
            filter: `booking_id=eq.${bookingId}`,
          },
          () => {
            loadTransaction();
            loadBooking();
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
  }, [bookingId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mb-6 h-6 w-32 rounded bg-gray-200" />

          <div className="h-[900px] rounded-3xl bg-gray-200" />
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

  const centre = booking.slot?.centre;

  const formattedDate = booking.slot
    ? new Date(
        `${booking.slot.slot_date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date unavailable";

  const formattedStartTime =
    booking.slot?.start_time
      ? booking.slot.start_time.slice(0, 5)
      : "—";

  const formattedEndTime =
    booking.slot?.end_time
      ? booking.slot.end_time.slice(0, 5)
      : "—";

  const showQrPass =
    booking.status !== "cancelled" &&
    Boolean(
      booking.qr_token &&
        booking.id &&
        booking.token_number
    );

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Back */}

        <Link
          href="/my-booking"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={18} />
          Back to My Booking
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* Token Header */}

          <div className="bg-[var(--color-primary)] px-6 py-7 text-white">
            <p className="text-sm opacity-90">
              Your Token
            </p>

            <p className="mt-1 text-5xl font-bold">
              #{booking.token_number}
            </p>

            <div
              className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${getBookingStatusClass(
                booking.status
              )}`}
            >
              {getBookingStatusLabel(
                booking.status
              )}
            </div>
          </div>

          <div className="space-y-7 p-6">

            {/* Digital Procurement Pass */}

            {showQrPass && (
              <BookingQrCode
                bookingId={booking.id}
                qrToken={booking.qr_token}
                tokenNumber={
                  booking.token_number
                }
              />
            )}

            {/* Cancelled Notice */}

            {booking.status ===
              "cancelled" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

                  <div>
                    <p className="font-semibold text-red-800">
                      Booking Cancelled
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      This booking has been
                      cancelled. Its queue position
                      and slot capacity have been
                      released.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    {centre.centre_code}
                  </p>
                </div>
              </div>
            )}

            {/* Date / Time */}

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

            {/* Booking Information */}

            <div className="grid gap-4 sm:grid-cols-3">

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
                  <Wheat
                    size={18}
                    className="text-gray-500"
                  />

                  <p className="text-sm text-gray-500">
                    Crop
                  </p>
                </div>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {booking.commodity?.name ||
                    "Not provided"}
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

            {/* Current Stage */}

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-medium text-green-700">
                Current Stage
              </p>

              <p className="mt-1 text-xl font-bold capitalize text-green-900">
                {booking.current_stage ||
                  "Booking"}
              </p>
            </div>

            {/* Gate Pass */}

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

            {/* Procurement & Payment */}

            {paymentLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading procurement payment details...
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
                        Final procurement amount and payment status
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5">

                  {/* Amount Summary */}

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

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {getPaymentLabel(
                            transaction.payment_status
                          )}
                        </p>

                        <p className="mt-1 text-sm opacity-90">
                          {transaction.payment_status ===
                          "pending"
                            ? "Your procurement has been completed. Payment is waiting to be processed."
                            : transaction.payment_status ===
                              "processing"
                            ? "Your payment is currently being processed through the PFMS/DBT payment system."
                            : transaction.payment_status ===
                              "credited"
                            ? "The procurement payment has been credited successfully."
                            : "There was a problem processing the payment. Please contact the procurement centre."}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Payment Details */}

                  {transaction.payment_reference && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-xs text-blue-600">
                            Payment Reference
                          </p>

                          <p className="mt-1 break-all font-mono text-sm font-semibold text-blue-900">
                            {
                              transaction.payment_reference
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-blue-600">
                            Payment Initiated
                          </p>

                          <p className="mt-1 text-sm font-semibold text-blue-900">
                            {formatDateTime(
                              transaction.payment_initiated_at
                            )}
                          </p>
                        </div>

                        {transaction.payment_completed_at && (
                          <div>
                            <p className="text-xs text-blue-600">
                              Payment Credited
                            </p>

                            <p className="mt-1 text-sm font-semibold text-blue-900">
                              {formatDateTime(
                                transaction.payment_completed_at
                              )}
                            </p>
                          </div>
                        )}

                        {transaction.receipt_number && (
                          <div>
                            <p className="text-xs text-blue-600">
                              Receipt Number
                            </p>

                            <p className="mt-1 font-mono text-sm font-semibold text-blue-900">
                              {
                                transaction.receipt_number
                              }
                            </p>
                          </div>
                        )}

                        {transaction.j_form_number && (
                          <div>
                            <p className="text-xs text-blue-600">
                              J-Form Number
                            </p>

                            <p className="mt-1 font-mono text-sm font-semibold text-blue-900">
                              {
                                transaction.j_form_number
                              }
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                </div>
              </section>
            ) : paymentError ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <IndianRupee className="mt-0.5 h-5 w-5 text-gray-500" />

                  <div>
                    <p className="font-medium text-gray-700">
                      Procurement Payment
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Payment details will appear here after your procurement transaction is created.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Booking Information */}

            <div className="flex gap-3 rounded-2xl bg-gray-50 p-4">
              <Ticket
                size={20}
                className="mt-0.5 shrink-0 text-gray-500"
              />

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Keep this booking information
                  available when you visit the
                  procurement centre.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your token and digital procurement
                  pass can be used for gate verification.
                </p>
              </div>
            </div>

            {/* Actions */}

            <div className="space-y-3">

              {isCancellableBooking(
                booking.status
              ) && (
                <CancelBookingButton
                  bookingId={booking.id}
                  onCancelled={loadBooking}
                />
              )}

              {isActiveBooking(
                booking.status
              ) && (
                <Link
                  href={`/my-queue?booking=${booking.id}`}
                  className="block w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  View Live Queue
                </Link>
              )}

              <Link
                href="/my-booking"
                className="block w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to My Bookings
              </Link>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}