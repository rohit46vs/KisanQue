import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  QrCode,
  UserRound,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ProcurementPrices from "@/components/farmer/ProcurementPrices";

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
      language,
      address_line1,
      village,
      district,
      state,
      pincode,
      phone_verified_at,
      onboarding_completed
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

  const address =
    profile?.address_line1 ||
    "Not added";

  const village =
    profile?.village ||
    "Not added";

  const district =
    profile?.district ||
    "Not added";

  const state =
    profile?.state ||
    null;

  const pincode =
    profile?.pincode ||
    "Not added";

  const isFarmer =
    role === "farmer";

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#17351f]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#dce9df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Logo */}
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

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* My Profile Dropdown */}
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#d8e5dc] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#52645a] transition hover:border-[#a9cfb4] hover:bg-[#f3faf5] hover:text-[#16803c] [&::-webkit-details-marker]:hidden">
                <UserRound size={14} />

                <span className="hidden sm:inline">
                  My Profile
                </span>
              </summary>

              <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[340px] overflow-hidden rounded-2xl border border-[#dce9df] bg-white shadow-[0_18px_45px_rgba(22,74,40,0.14)]">
                {/* Profile Header */}
                <div className="border-b border-[#e6eee8] bg-[#f5fbf7] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2f7e9] text-[#16803c]">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#123d25]">
                        {displayName}
                      </p>

                      <p className="truncate text-[10px] text-[#718078]">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  <ProfileDropdownItem
                    icon={<UserRound size={14} />}
                    label="Full Name"
                    value={displayName}
                  />

                  <ProfileDropdownItem
                    icon={<Mail size={14} />}
                    label="Email"
                    value={email}
                  />

                  <ProfileDropdownItem
                    icon={<Phone size={14} />}
                    label="Mobile Number"
                    value={phone}
                  />

                  <ProfileDropdownItem
                    icon={<MapPin size={14} />}
                    label="Address"
                    value={address}
                  />

                  <ProfileDropdownItem
                    icon={<MapPin size={14} />}
                    label="Village / Locality"
                    value={village}
                  />

                  <ProfileDropdownItem
                    icon={<MapPin size={14} />}
                    label="District"
                    value={district}
                  />

                  <ProfileDropdownItem
                    icon={<MapPin size={14} />}
                    label="State / Union Territory"
                    value={state ?? "Not added"}
                  />

                  <ProfileDropdownItem
                    icon={<MapPin size={14} />}
                    label="Pincode"
                    value={pincode}
                  />

                  <ProfileDropdownItem
                    icon={<span className="text-xs font-bold">A</span>}
                    label="Preferred Language"
                    value={getLanguageName(language)}
                  />

                  {/* Verification Status */}
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-[#f8faf9] px-3 py-2.5">
                    <span className="text-[10px] font-medium text-[#718078]">
                      Mobile verification
                    </span>

                    {profile?.phone_verified_at ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f8ee] px-2 py-1 text-[9px] font-semibold text-[#16803c]">
                        <CheckCircle2 size={11} />
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f4f5f4] px-2 py-1 text-[9px] font-semibold text-[#78827c]">
                        Not verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[#e6eee8] bg-white p-3">
                  <Link
                    href="/onboarding"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#dce9df] bg-[#f7faf8] px-3 py-2.5 text-[10px] font-semibold text-[#52645a] transition hover:border-[#a9cfb4] hover:bg-[#edf8f0] hover:text-[#16803c]"
                  >
                    Update Profile
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </details>

            {/* Logout */}
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-[#d8e5dc] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#52645a] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={14} />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </form>
          </div>
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

        {/* Non Farmer Warning */}
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

        {/* Quick Actions */}
        {isFarmer && (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <AccountAction
              href="/centres"
              icon={<CalendarDays size={21} />}
              title="Book a Slot"
              description="Find a procurement centre and choose an available slot."
              primary
            />

            <AccountAction
              href="/my-booking"
              icon={<QrCode size={21} />}
              title="My Booking"
              description="View your confirmed booking, token and gate pass."
            />

            <AccountAction
              href="/my-queue"
              icon={<Users size={21} />}
              title="My Queue"
              description="Track your live queue position and procurement stage."
            />
          </section>
        )}

        {/* Procurement Prices */}
        {isFarmer && (
          <ProcurementPrices farmerState={state} />
        )}

        {/* Profile shortcut */}
        <section className="mt-8 rounded-[20px] border border-[#dce9df] bg-gradient-to-r from-[#f0faf3] to-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e1f6e8] text-[#16803c]">
                <UserRound size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#16803c]">
                  Account
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#17351f]">
                  Your profile is available from the top menu.
                </p>

                <p className="mt-0.5 text-[11px] text-[#718078]">
                  Click “My Profile” above to view your personal and contact details.
                </p>
              </div>
            </div>

            <span className="hidden text-[#16803c] sm:block">
              <ArrowRight size={18} />
            </span>
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

function ProfileDropdownItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#f7faf8]">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf8f1] text-[#16803c]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase tracking-wide text-[#89958e]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-[11px] font-semibold text-[#17351f]">
          {value}
        </p>
      </div>
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

function getLanguageName(language: string) {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    pa: "Punjabi",
    mr: "Marathi",
    bn: "Bengali",
    te: "Telugu",
    ta: "Tamil",
  };

  return (
    languages[language] ??
    language.toUpperCase()
  );
}