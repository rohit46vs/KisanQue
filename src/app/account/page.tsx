import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  LogOut,
  QrCode,
  UserRound,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      phone,
      role,
      language
      `
    )
    .eq("id", user.id)
    .maybeSingle();

  async function signOut() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/");
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Farmer";

  const email =
    profile?.email ||
    user.email ||
    "Not available";

  const phone =
    profile?.phone ||
    "Not added";

  const language =
    profile?.language || "en";

  const role =
    profile?.role || "farmer";

  const isFarmer =
    role === "farmer";

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#17351f]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#dce9df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8ee]">
              <UserRound
                size={21}
                className="text-[#16803c]"
              />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-tight text-[#123d25]">
                KisanQueue
              </div>

              <div className="text-[8px] font-medium text-[#718078]">
                Farmer Account
              </div>
            </div>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-[#d8e5dc] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#52645a] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={14} />
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Welcome */}
        <section className="rounded-[22px] border border-[#d7e9dc] bg-white p-6 shadow-[0_8px_30px_rgba(22,74,40,0.05)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eaf8ef] text-[#16803c]">
                <UserRound size={28} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16803c]">
                  My Account
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#123d25] sm:text-3xl">
                  Welcome, {displayName}
                </h1>

                <p className="mt-1 text-sm text-[#718078]">
                  Manage your procurement journey from one place.
                </p>
              </div>
            </div>

            {isFarmer ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ecfdf3] px-3 py-1.5 text-[10px] font-semibold text-[#16803c]">
                <CheckCircle2 size={13} />
                Farmer account
              </span>
            ) : (
              <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-700">
                {role}
              </span>
            )}
          </div>
        </section>

        {!isFarmer && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              This account is not registered as a farmer.
            </p>

            <p className="mt-1 text-xs text-amber-800">
              Farmer booking features are available only for
              accounts with the farmer role.
            </p>
          </div>
        )}

        {/* Quick actions */}
        {isFarmer && (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <AccountAction
              href="/centres"
              icon={
                <CalendarDays size={21} />
              }
              title="Book a Slot"
              description="Find a procurement centre and choose an available slot."
              primary
            />

            <AccountAction
              href="/my-booking"
              icon={
                <QrCode size={21} />
              }
              title="My Booking"
              description="View your confirmed booking, token and gate pass."
            />

            <AccountAction
              href="/my-queue"
              icon={
                <Users size={21} />
              }
              title="My Queue"
              description="Track your live queue position and procurement stage."
            />
          </section>
        )}

        {/* Profile */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16803c]">
              Profile
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#123d25]">
              Account Information
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileCard
              label="Full Name"
              value={displayName}
            />

            <ProfileCard
              label="Email"
              value={email}
            />

            <ProfileCard
              label="Mobile Number"
              value={phone}
            />

            <ProfileCard
              label="Preferred Language"
              value={getLanguageName(
                language
              )}
            />
          </div>
        </section>

        {/* Journey */}
        {isFarmer && (
          <section className="mt-8 rounded-[20px] border border-[#dce9df] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16803c]">
                  Your journey
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#123d25]">
                  Procurement at a glance
                </h2>
              </div>

              <ArrowRight
                size={18}
                className="text-[#16803c]"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <JourneyStep
                number="01"
                title="Book"
              />

              <JourneyStep
                number="02"
                title="Get Token"
              />

              <JourneyStep
                number="03"
                title="Track Queue"
              />

              <JourneyStep
                number="04"
                title="Receive Payment"
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function AccountAction({
  href,
  icon,
  title,
  description,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 transition ${
        primary
          ? "border-[#16803c] bg-[#16803c] text-white shadow-[0_8px_25px_rgba(22,128,60,0.15)] hover:bg-[#116b32]"
          : "border-[#dce9df] bg-white text-[#17351f] hover:border-[#a9cfb4] hover:shadow-[0_8px_25px_rgba(22,74,40,0.06)]"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          primary
            ? "bg-white/15 text-white"
            : "bg-[#eaf8ef] text-[#16803c]"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`mt-4 text-sm font-bold ${
          primary
            ? "text-white"
            : "text-[#17351f]"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1 text-xs leading-5 ${
          primary
            ? "text-white/75"
            : "text-[#718078]"
        }`}
      >
        {description}
      </p>

      <div
        className={`mt-4 flex items-center gap-1 text-[10px] font-semibold ${
          primary
            ? "text-white"
            : "text-[#16803c]"
        }`}
      >
        Open
        <ArrowRight
          size={13}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function ProfileCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#dce9df] bg-white p-4">
      <p className="text-[10px] font-medium text-[#829087]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#17351f] break-words">
        {value}
      </p>
    </div>
  );
}

function JourneyStep({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-[#e2ece5] bg-[#f9fcfa] p-4">
      <span className="text-[10px] font-bold text-[#16803c]">
        {number}
      </span>

      <p className="mt-2 text-xs font-semibold text-[#355043]">
        {title}
      </p>
    </div>
  );
}

function getLanguageName(
  language: string
) {
  const languages: Record<
    string,
    string
  > = {
    en: "English",
    hi: "Hindi",
    pa: "Punjabi",
    mr: "Marathi",
  };

  return (
    languages[language] ??
    language.toUpperCase()
  );
}