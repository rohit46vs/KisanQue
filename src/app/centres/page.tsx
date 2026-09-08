import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CentreMap from "@/components/farmer/CentreMap";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default async function CentresPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: centres, error } = await supabase
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
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Centre fetch error:", error.message);
  }

  const safeCentres = centres ?? [];

  return (
    <main className="min-h-screen bg-[var(--color-background)] py-10">
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-[var(--color-primary)]">
              KisanQueue
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Find a Procurement Centre
            </h1>

            <p className="mt-2 max-w-2xl text-[var(--color-text-secondary)]">
              Find an active procurement centre and choose a convenient slot for
              your visit.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <CentreMap centres={safeCentres} />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Centres</h2>

              {safeCentres.length === 0 ? (
                <Card className="p-6">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    No procurement centres are currently available.
                  </p>
                </Card>
              ) : (
                safeCentres.map((centre) => (
                  <Card key={centre.id} hover className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-primary)]">
                          {centre.centre_code}
                        </p>

                        <h3 className="mt-1 font-semibold">{centre.name}</h3>
                      </div>

                      <span className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                        Active
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-5 text-[var(--color-text-secondary)]">
                      {centre.address}
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {centre.district}, {centre.state}
                      {centre.pincode ? ` - ${centre.pincode}` : ""}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Daily capacity: {centre.daily_capacity}
                      </span>

                      <Link
                        href={`/centres/${centre.id}`}
                        className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-dark)]"
                      >
                        View slots
                      </Link>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
