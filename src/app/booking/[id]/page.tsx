import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  CalendarDays,
  Clock,
  Ticket,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

type BookingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingPage({
  params,
}: BookingPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
      .eq("id", id)
      .eq("farmer_id", user.id)
      .single();

  if (error || !booking) {
    console.error(
      "Booking fetch error:",
      error?.message
    );

    notFound();
  }

  const slot = Array.isArray(booking.slot)
    ? booking.slot[0]
    : booking.slot;

  if (!slot) {
    notFound();
  }

  const centre = Array.isArray(slot.centre)
    ? slot.centre[0]
    : slot.centre;

  if (!centre) {
    notFound();
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
          {/* Success */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
              <CheckCircle2
                size={34}
                className="text-[var(--color-primary)]"
              />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight">
              Slot Booked Successfully!
            </h1>

            <p className="mt-2 text-[var(--color-text-secondary)]">
              Your procurement visit has been
              confirmed.
            </p>
          </div>

          {/* Token */}
          <Card className="overflow-hidden">
            <div className="bg-[var(--color-primary)] px-6 py-8 text-center text-white">
              <div className="flex items-center justify-center gap-2 text-sm font-medium opacity-90">
                <Ticket size={18} />
                Your Token Number
              </div>

              <p className="mt-2 text-5xl font-bold tracking-tight">
                A-{String(
                  booking.token_number
                ).padStart(3, "0")}
              </p>

              <p className="mt-2 text-sm opacity-90">
                Keep this token number safe.
              </p>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              {/* Centre */}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <MapPin
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">
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
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <CalendarDays
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Visit Date
                  </p>

                  <p className="mt-1 font-semibold">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)]">
                  <Clock
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Time Slot
                  </p>

                  <p className="mt-1 font-semibold">
                    {startTime} – {endTime}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Booking status
                  </span>

                  <span className="rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold capitalize text-[var(--color-primary)]">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/centres"
              className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Find Another Centre
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}