import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Ticket,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default async function MyQueuePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the farmer's active booking
  const { data: booking, error: bookingError } =
    await supabase
      .from("bookings")
      .select(
        `
        id,
        slot_id,
        token_number,
        status,
        booked_at,
        slot:slots (
          id,
          slot_date,
          start_time,
          end_time,
          capacity,
          centre_id
        )
        `
      )
      .eq("farmer_id", user.id)
      .in("status", [
        "booked",
        "waiting",
        "called",
        "arrived",
        "inspected",
        "accepted",
        "payment",
      ])
      .order("booked_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (bookingError) {
    console.error(
      "Queue booking error:",
      bookingError.message
    );
  }

  if (!booking) {
    redirect("/my-booking");
  }

  const slot = Array.isArray(booking.slot)
    ? booking.slot[0]
    : booking.slot;

  if (!slot) {
    notFound();
  }

  /*
   * Count active bookings ahead of this farmer.
   *
   * For the initial version, queue order is based
   * on token number.
   */
  const { count: peopleAhead, error: queueError } =
    await supabase
      .from("bookings")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("slot_id", booking.slot_id)
      .lt("token_number", booking.token_number)
      .in("status", [
        "booked",
        "waiting",
        "called",
        "arrived",
      ]);

  if (queueError) {
    console.error(
      "Queue count error:",
      queueError.message
    );
  }

  const safePeopleAhead =
    peopleAhead ?? 0;

  /*
   * Find the current token being served.
   *
   * For now, a booking with status "called"
   * represents the currently called farmer.
   */
  const { data: currentBooking } =
    await supabase
      .from("bookings")
      .select("token_number")
      .eq("slot_id", booking.slot_id)
      .eq("status", "called")
      .order("token_number")
      .limit(1)
      .maybeSingle();

  const currentToken =
    currentBooking?.token_number ?? null;

  const slotDate = new Date(
    `${slot.slot_date}T00:00:00`
  );

  const formattedDate =
    slotDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const startTime = slot.start_time.slice(0, 5);
  const endTime = slot.end_time.slice(0, 5);

  const statusLabel =
    booking.status === "called"
      ? "Your turn"
      : booking.status === "arrived"
        ? "Arrived"
        : booking.status === "inspected"
          ? "Under inspection"
          : booking.status === "accepted"
            ? "Accepted"
            : booking.status === "payment"
              ? "Payment"
              : "Waiting";

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Back */}
          <Link
            href="/my-booking"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={16} />
            Back to my booking
          </Link>

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[var(--color-primary)]">
              KisanQueue
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Live Queue
            </h1>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Track your position in the procurement
              queue.
            </p>
          </div>

          {/* Main queue card */}
          <Card className="overflow-hidden">
            {/* Token */}
            <div className="bg-[var(--color-primary)] px-6 py-8 text-center text-white">
              <div className="flex items-center justify-center gap-2 text-sm font-medium opacity-90">
                <Ticket size={18} />
                Your Token
              </div>

              <p className="mt-2 text-5xl font-bold tracking-tight">
                A-
                {String(
                  booking.token_number
                ).padStart(3, "0")}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                {statusLabel}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Queue statistics */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* People ahead */}
                <div className="rounded-2xl bg-[var(--color-surface-muted)] p-5 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                    <Users
                      size={20}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">
                    People Ahead
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {safePeopleAhead}
                  </p>
                </div>

                {/* Current token */}
                <div className="rounded-2xl bg-[var(--color-surface-muted)] p-5 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                    <Ticket
                      size={20}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">
                    Currently Called
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {currentToken
                      ? `A-${String(
                          currentToken
                        ).padStart(3, "0")}`
                      : "—"}
                  </p>
                </div>

                {/* Estimated wait */}
                <div className="rounded-2xl bg-[var(--color-surface-muted)] p-5 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                    <Clock
                      size={20}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">
                    Estimated Wait
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {safePeopleAhead === 0
                      ? "Now"
                      : `~${safePeopleAhead * 10} min`}
                  </p>
                </div>
              </div>

              {/* Queue progress */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Queue Status
                  </p>

                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-primary)]" />
                    Live
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                    style={{
                      width:
                        safePeopleAhead === 0
                          ? "100%"
                          : `${Math.max(
                              10,
                              100 -
                                safePeopleAhead *
                                  10
                            )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {safePeopleAhead === 0
                    ? "You are next in line."
                    : `${safePeopleAhead} ${
                        safePeopleAhead === 1
                          ? "person"
                          : "people"
                      } ahead of you.`}
                </p>
              </div>

              {/* Visit details */}
              <div className="mt-8 space-y-5 border-t border-[var(--color-border)] pt-6">
                <div className="flex gap-3">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                  />

                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Procurement Centre
                    </p>

                    <p className="mt-1 font-semibold">
                      Centre ID:{" "}
                      {slot.centre_id}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                  />

                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Visit
                    </p>

                    <p className="mt-1 font-semibold">
                      {formattedDate}
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {startTime} – {endTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Refresh */}
          <div className="mt-5 text-center">
            <p className="text-xs text-[var(--color-text-muted)]">
              Queue data is currently loaded from
              Supabase.
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Live automatic updates will be added
              next.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}