import BookSlotButton from "@/components/farmer/BookSlotButton";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

type CentrePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CentrePage({ params }: CentrePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch centre
  const { data: centre, error: centreError } = await supabase
    .from("procurement_centres")
    .select(
      `
        id,
        centre_code,
        name,
        state,
        district,
        address,
        pincode,
        latitude,
        longitude,
        daily_capacity,
        is_active
        `,
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (centreError || !centre) {
    notFound();
  }

  // Fetch active slots for this centre
  const { data: slots, error: slotsError } = await supabase
    .from("slots")
    .select(
      `
        id,
        slot_date,
        start_time,
        end_time,
        capacity,
        booked_count,
        is_active
        `,
    )
    .eq("centre_id", centre.id)
    .eq("is_active", true)
    .gte("slot_date", new Date().toISOString().split("T")[0])
    .order("slot_date")
    .order("start_time");

  if (slotsError) {
    console.error("Slot fetch error:", slotsError.message);
  }

  const safeSlots = slots ?? [];

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-10">
      <Container>
        <div className="mx-auto max-w-5xl">
          {/* Back button */}
          <Link
            href="/centres"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={16} />
            Back to centres
          </Link>

          {/* Centre information */}
          <Card className="overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-primary)]">
                    {centre.centre_code}
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {centre.name}
                  </h1>

                  <div className="mt-4 flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    />

                    <div>
                      <p>{centre.address}</p>

                      <p className="mt-1">
                        {centre.district}, {centre.state}
                        {centre.pincode ? ` - ${centre.pincode}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)]">
                  Active
                </span>
              </div>

              <div className="mt-6 grid gap-4 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Users size={17} />
                    Daily capacity
                  </div>

                  <p className="mt-1 text-xl font-bold">
                    {centre.daily_capacity}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin size={17} />
                    Location
                  </div>

                  <p className="mt-1 text-sm font-semibold">
                    {centre.district}, {centre.state}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Slots */}
          <div className="mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Available Slots</h2>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Choose a convenient time for your visit.
              </p>
            </div>

            {safeSlots.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="font-medium">No slots are currently available.</p>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Please check again later or choose another procurement centre.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {safeSlots.map((slot) => {
                  const remaining = slot.capacity - slot.booked_count;

                  const slotDate = new Date(`${slot.slot_date}T00:00:00`);

                  const formattedDate = slotDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  const formattedStart = slot.start_time.slice(0, 5);

                  const formattedEnd = slot.end_time.slice(0, 5);

                  const isFull = remaining <= 0;

                  return (
                    <Card key={slot.id} hover={!isFull} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-primary)]">
                            {formattedDate}
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            {formattedStart} – {formattedEnd}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isFull
                              ? "bg-red-50 text-red-700"
                              : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          }`}
                        >
                          {isFull ? "Full" : `${remaining} left`}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {slot.booked_count} / {slot.capacity} booked
                        </span>

                        <BookSlotButton slotId={slot.id} disabled={isFull} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
