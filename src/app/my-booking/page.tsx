import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  MapPin,
  CalendarDays,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default async function MyBookingPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the farmer's latest active booking
  const { data: booking, error } =
    await supabase
      .from("bookings")
      .select(
        `
        id,
        token_number,
        status,
        booked_at,
        slot:slots (
          id,
          slot_date,
          start_time,
          end_time,
          centre:procurement_centres (
            id,
            centre_code,
            name,
            address,
            district,
            state,
            pincode
          )
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

  if (error) {
    console.error(
      "My booking fetch error:",
      error.message
    );
  }

  // No active booking
  if (!booking) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] py-10">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <p className="text-sm font-medium text-[var(--color-primary)]">
                KisanQueue
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                My Booking
              </h1>
            </div>

            <Card className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                <Ticket
                  size={28}
                  className="text-[var(--color-primary)]"
                />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                No active booking
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
                You don't have an active procurement
                booking right now. Find a centre and
                book a convenient slot.
              </p>

              <Link
                href="/centres"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Find a Centre
                <ArrowRight size={16} />
              </Link>
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  const slot = Array.isArray(booking.slot)
    ? booking.slot[0]
    : booking.slot;

  if (!slot) {
    return null;
  }

  const centre = Array.isArray(slot.centre)
    ? slot.centre[0]
    : slot.centre;

  if (!centre) {
    return null;
  }

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

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-10">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[var(--color-primary)]">
              KisanQueue
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              My Booking
            </h1>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Your current procurement visit details.
            </p>
          </div>

          {/* Token card */}
          <Card className="overflow-hidden">
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

              <div className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold capitalize">
                {booking.status}
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {/* Centre */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <MapPin
                    size={20}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Procurement Centre
                  </p>

                  <p className="mt-1 font-semibold">
                    {centre.name}
                  </p>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {centre.address}
                  </p>

                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {centre.district},{" "}
                    {centre.state}
                    {centre.pincode
                      ? ` - ${centre.pincode}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <CalendarDays
                    size={20}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Visit Date
                  </p>

                  <p className="mt-1 font-semibold">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <Clock
                    size={20}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Time Slot
                  </p>

                  <p className="mt-1 font-semibold">
                    {startTime} – {endTime}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Queue button */}
          <Link
            href={`/booking/${booking.id}`}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            View Booking Details
            <ArrowRight size={17} />
          </Link>

          {/* Find another centre */}
          <Link
            href="/centres"
            className="mt-3 block rounded-xl border border-[var(--color-border)] bg-white px-5 py-3.5 text-center text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Find Another Centre
          </Link>
        </div>
      </Container>
    </main>
  );
}