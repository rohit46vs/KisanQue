import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Globe2,
  Leaf,
  MapPin,
  Menu,
  QrCode,
  ShieldCheck,
  Sprout,
  Users,
  Wheat,
} from "lucide-react";

import IndiaProcurementMap, {
  ProcurementState,
} from "@/components/farmer/IndiaProcurementMap";

import {
  getDashboardStats,
  getPublicActivity,
} from "@/lib/supabase/dashboard";

import { getStateProcurement } from "@/lib/supabase/state-procurement";

export default async function HomePage() {
  const stats = await getDashboardStats();

  const stateProcurement = await getStateProcurement();

  const publicActivity = await getPublicActivity();

  const stateColors: Record<
    string,
    {
      color: string;
      softColor: string;
    }
  > = {
    PB: {
      color: "#16803c",
      softColor: "#dcfce7",
    },

    HR: {
      color: "#2563eb",
      softColor: "#dbeafe",
    },

    UP: {
      color: "#d97706",
      softColor: "#fef3c7",
    },

    MP: {
      color: "#7c3aed",
      softColor: "#ede9fe",
    },

    RJ: {
      color: "#ca8a04",
      softColor: "#fef9c3",
    },

    KA: {
      color: "#059669",
      softColor: "#d1fae5",
    },

    OD: {
      color: "#0891b2",
      softColor: "#cffafe",
    },

    TG: {
      color: "#16a34a",
      softColor: "#dcfce7",
    },

    GJ: {
      color: "#eab308",
      softColor: "#fef9c3",
    },
  };

  const stateCodes: Record<string, string> = {
    Punjab: "PB",
    Haryana: "HR",
    "Uttar Pradesh": "UP",
    "Madhya Pradesh": "MP",
    Rajasthan: "RJ",
    Karnataka: "KA",
    Odisha: "OD",
    Telangana: "TG",
    Gujarat: "GJ",
  };

  const liveStateData: ProcurementState[] =
    stateProcurement.map((state) => {
      const code =
        stateCodes[state.state] ??
        state.state.toUpperCase();

      const colors =
        stateColors[code] ?? {
          color: "#16803c",
          softColor: "#dcfce7",
        };

      return {
        code: code as ProcurementState["code"],
        name: state.state,
        farmers: state.farmers,
        quantityQtl: state.quantityQtl,
        quantityMt: state.quantityMt,
        centres: state.procurementCentres,
        color: colors.color,
        softColor: colors.softColor,
        status:
          state.procurementCentres > 0
            ? "active"
            : "inactive",
      };
    });

  const farmerCount =
    stats.totalFarmers > 0
      ? stats.totalFarmers.toLocaleString("en-IN")
      : "0";

  const centreCount =
    stats.activeCentres > 0
      ? stats.activeCentres.toLocaleString("en-IN")
      : "0";

  const quantity =
    stats.totalQuantity > 0
      ? stats.totalQuantity.toLocaleString("en-IN")
      : "0";

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#17351f]">

      {/* =====================================================
          TOP SEASON BAR
      ====================================================== */}

      <div className="border-b border-[#d9eee0] bg-[#eaf8ef]">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-5 text-[10px] sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#16803c]">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-[#16803c] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[#16803c]" />
            </span>

            <span className="font-medium">
              Procurement season is currently active
            </span>
          </div>

          <span className="hidden text-[#64736a] sm:block">
            Kharif Procurement Season 2026–27
          </span>
        </div>
      </div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#dce9df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8ee]">
              <Sprout
                size={23}
                strokeWidth={2}
                className="text-[#16803c]"
              />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-tight text-[#123d25]">
                KisanQueue
              </div>

              <div className="text-[8px] font-medium text-[#718078]">
                Smart Procurement for Farmers
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-[12px] font-semibold text-[#16803c]"
            >
              Home
            </Link>

            <Link
              href="/centres"
              className="text-[12px] text-[#52645a] transition hover:text-[#16803c]"
            >
              Procurement Centres
            </Link>

            <a
              href="#how-it-works"
              className="text-[12px] text-[#52645a] transition hover:text-[#16803c]"
            >
              How It Works
            </a>

            <a
              href="#updates"
              className="text-[12px] text-[#52645a] transition hover:text-[#16803c]"
            >
              Updates
            </a>

            <a
              href="#help"
              className="text-[12px] text-[#52645a] transition hover:text-[#16803c]"
            >
              Help
            </a>
          </nav>

          {/* Header actions */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-lg border border-[#dce8df] bg-white px-3 py-2 text-[11px] font-medium text-[#42564a] sm:flex"
            >
              <Globe2 size={13} />
              EN
            </button>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-[#16803c] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#116b32]"
            >
              Login
              <ArrowRight size={13} />
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dce8df] md:hidden"
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-white">

        <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-[#e5f7eb] opacity-50 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#e8f7ed] opacity-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_430px] lg:px-8 lg:py-20">

          <div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d5eadb] bg-[#f5fbf7] px-3 py-1.5 text-[10px] font-medium text-[#16803c]">
              <ShieldCheck size={12} />
              Government Procurement Queue Platform
            </div>

            <h1 className="max-w-[650px] text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#17351f] sm:text-5xl lg:text-[56px]">
              Know your place in the{" "}
              <span className="text-[#16803c]">
                procurement queue.
              </span>
            </h1>

            <p className="mt-6 max-w-[560px] text-[14px] leading-6 text-[#627168] sm:text-[15px]">
              KisanQueue helps farmers book procurement slots, receive digital
              tokens, track their live queue and follow payment status — without
              unnecessary waiting at the centre.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/centres"
                className="inline-flex items-center gap-2 rounded-lg bg-[#16803c] px-5 py-3 text-[11px] font-semibold text-white shadow-[0_5px_15px_rgba(22,128,60,0.18)] transition hover:bg-[#116b32]"
              >
                Book a Procurement Slot
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/centres"
                className="inline-flex items-center gap-2 rounded-lg border border-[#d5e5da] bg-white px-5 py-3 text-[11px] font-semibold text-[#355043] transition hover:border-[#16803c] hover:text-[#16803c]"
              >
                <MapPin size={14} />
                Find a Centre
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
              <TrustPoint text="Secure login" />
              <TrustPoint text="Live queue updates" />
              <TrustPoint text="Multilingual support" />
            </div>
          </div>

          {/* Dashboard card */}

          <div className="relative">
            <div className="rounded-[20px] border border-[#dcebe1] bg-[#f5faf6] p-3 shadow-[0_15px_40px_rgba(22,74,40,0.08)]">

              <div className="rounded-[14px] bg-[#123d25] p-4 text-white sm:p-5">

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wide text-[#a8d7b5]">
                      Today&apos;s procurement
                    </p>

                    <h2 className="mt-1 text-[17px] font-bold">
                      KisanQueue Dashboard
                    </h2>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Leaf size={18} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">

                  <DashboardMetric
                    icon={<Users size={12} />}
                    label="Farmers"
                    value={farmerCount}
                    sub="registered"
                  />

                  <DashboardMetric
                    icon={<Wheat size={12} />}
                    label="Quantity"
                    value={`${quantity} Qtl`}
                    sub="tracked"
                  />

                  <DashboardMetric
                    icon={<Clock3 size={12} />}
                    label="Avg. Wait"
                    value="26 min"
                    sub="across active centres"
                  />

                  <DashboardMetric
                    icon={<CircleDollarSign size={12} />}
                    label="Payments"
                    value="₹84.6 Cr"
                    sub="processed today"
                  />

                </div>

                <div className="mt-3 rounded-lg bg-white/5 p-3">

                  <div className="flex justify-between text-[9px]">
                    <span className="text-[#c8ded0]">
                      Procurement capacity used
                    </span>

                    <span className="font-semibold">
                      72%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-[#5fd483]" />
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 p-2.5">
                <MiniMetric
                  value={centreCount}
                  label="Active Centres"
                />

                <MiniMetric
                  value="28"
                  label="States / UTs"
                />

                <MiniMetric
                  value="99.9%"
                  label="Platform Uptime"
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          NATIONAL KPI STRIP
      ====================================================== */}

      <section className="border-y border-[#dce9df] bg-[#f9fcfa]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">

          <KpiCard
            icon={<Users size={18} />}
            value={farmerCount}
            suffix=""
            label="Farmers registered"
            iconClass="bg-[#dcfce7] text-[#16803c]"
          />

          <KpiCard
            icon={<Building2 size={18} />}
            value={centreCount}
            suffix=""
            label="Procurement centres"
            iconClass="bg-[#dbeafe] text-[#2563eb]"
          />

          <KpiCard
            icon={<Wheat size={18} />}
            value={quantity}
            suffix=" Qtl"
            label="Procurement tracked"
            iconClass="bg-[#fef3c7] text-[#d97706]"
          />

          <KpiCard
            icon={<CircleDollarSign size={18} />}
            value="₹84.6 Cr"
            suffix=""
            label="Payments processed"
            iconClass="bg-[#ede9fe] text-[#7c3aed]"
          />

        </div>
      </section>

      {/* =====================================================
          INDIA PROCUREMENT OVERVIEW
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">

        <div className="mb-8">

          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#16803c]">
            National procurement overview
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#123d25] sm:text-3xl">
            Procurement activity across India
          </h2>

          <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#718078]">
            View active procurement regions, participating farmers and reported
            quantities across the country.
          </p>

        </div>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">

          <IndiaProcurementMap
            states={liveStateData}
          />

          <div className="space-y-3">

            <div className="rounded-[17px] border border-[#dce9df] bg-white p-4 shadow-[0_5px_20px_rgba(22,74,40,0.04)]">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#829087]">
                    National total
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#123d25]">
                    {quantity} Qtl
                  </p>

                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf8ef] text-[#16803c]">
                  <Wheat size={17} />
                </div>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e6eee8]">
                <div className="h-full w-[72%] rounded-full bg-[#16803c]" />
              </div>

              <div className="mt-1 flex justify-between text-[8px] text-[#829087]">
                <span>Procurement progress</span>
                <span>72%</span>
              </div>

            </div>

            {/* State cards */}

            {liveStateData.map((state) => (
              <div
                key={state.code}
                className="group rounded-[15px] border border-[#dce9df] bg-white p-3.5 transition hover:border-[#b9d7c2] hover:shadow-[0_6px_20px_rgba(22,74,40,0.06)]"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-2.5">

                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[9px] font-bold"
                      style={{
                        backgroundColor:
                          state.softColor,
                        color: state.color,
                      }}
                    >
                      {state.code}
                    </span>

                    <div>

                      <p className="text-[11px] font-bold text-[#17351f]">
                        {state.name}
                      </p>

                      <p className="text-[8px] text-[#829087]">
                        {state.centres.toLocaleString(
                          "en-IN"
                        )}{" "}
                        procurement centres
                      </p>

                    </div>

                  </div>

                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-semibold"
                    style={{
                      backgroundColor:
                        state.status === "active"
                          ? "#ecfdf3"
                          : state.status === "limited"
                            ? "#fffbeb"
                            : "#f1f4f2",

                      color:
                        state.status === "active"
                          ? "#16803c"
                          : state.status === "limited"
                            ? "#b7791f"
                            : "#718078",
                    }}
                  >

                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          state.status === "active"
                            ? "#16803c"
                            : state.status === "limited"
                              ? "#d97706"
                              : "#9aa59f",
                      }}
                    />

                    {state.status === "active"
                      ? "Active"
                      : state.status === "limited"
                        ? "Limited"
                        : "No reporting"}

                  </span>

                </div>

                <div className="mt-3 grid grid-cols-2 border-t border-[#edf2ee] pt-2.5">

                  <div>

                    <p className="text-[10px] font-bold text-[#17351f]">
                      {state.farmers.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="text-[7px] text-[#829087]">
                      Farmers
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] font-bold text-[#17351f]">
                      {state.quantityMt.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      MT
                    </p>

                    <p className="text-[7px] text-[#829087]">
                      Quantity procured
                    </p>

                  </div>

                </div>

              </div>
            ))}

            {/* Centre CTA */}

            <Link
              href="/centres"
              className="flex items-center justify-between rounded-[13px] border border-[#cfe3d5] bg-[#f4faf6] px-4 py-3.5 text-[10px] font-semibold text-[#17351f] transition hover:border-[#16803c] hover:text-[#16803c]"
            >

              <span className="flex items-center gap-2">
                <MapPin
                  size={14}
                  className="text-[#16803c]"
                />

                Find a procurement centre near you
              </span>

              <ArrowRight size={14} />

            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVITY + UPDATES
      ====================================================== */}

      <section
        id="updates"
        className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 sm:px-6 lg:grid-cols-2 lg:px-8"
      >

        {/* Platform activity */}

        <InfoPanel
          icon={<BarChart3 size={17} />}
          title="Platform Activity"
          subtitle="Recent updates from procurement centres."
          action="View All"
        >

          {publicActivity.length > 0 ? (
            publicActivity.map(
              (activity, index) => {
                const details =
                  getActivityDetails(
                    activity.eventType
                  );

                const isRecent =
                  Date.now() -
                    new Date(
                      activity.occurredAt
                    ).getTime() <
                  10 * 60 * 1000;

                return (
                  <ActivityRow
                    key={`${activity.eventType}-${activity.occurredAt}-${index}`}
                    icon={details.icon}
                    title={details.title}
                    description={
                      activity.tokenNumber
                        ? `${details.description} · Token #${activity.tokenNumber} · ${activity.centreName}, ${activity.state}`
                        : `${details.description} · ${activity.centreName}, ${activity.state}`
                    }
                    time={formatActivityTime(
                      activity.occurredAt
                    )}
                    live={
                      index === 0 &&
                      isRecent
                    }
                  />
                );
              }
            )
          ) : (
            <div className="py-8 text-center">

              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#eef9f1] text-[#16803c]">
                <BarChart3 size={17} />
              </div>

              <p className="mt-2 text-[10px] font-semibold text-[#355043]">
                No recent activity
              </p>

              <p className="mt-1 text-[8px] text-[#829087]">
                Procurement centre activity will appear here.
              </p>

            </div>
          )}

        </InfoPanel>

        {/* Important updates */}

        <InfoPanel
          icon={<Bell size={17} />}
          title="Important Updates"
          subtitle="Latest procurement centre information."
          action="View All"
        >

          <ActivityRow
            icon={<Building2 size={16} />}
            title="New centres added"
            description="New procurement centres are now available"
            time="Today"
          />

          <ActivityRow
            icon={<Clock3 size={16} />}
            title="Extended timings"
            description="Selected centres may operate with extended hours"
            time="Yesterday"
          />

          <ActivityRow
            icon={<FileCheck2 size={16} />}
            title="Document advisory"
            description="Keep your land records and ID ready"
            time="Yesterday"
          />

        </InfoPanel>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="border-y border-[#dce9df] bg-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">

          <div className="mb-7 flex items-end justify-between">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#16803c]">
                Simple process
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#123d25]">
                How It Works
              </h2>

              <p className="mt-1 text-[11px] text-[#718078]">
                One digital journey for your procurement visit.
              </p>

            </div>

            <span className="hidden text-[10px] font-semibold text-[#16803c] sm:block">
              Four simple steps
            </span>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <HowStep
              number="01"
              icon={<Users size={18} />}
              title="Register"
              description="Create your account and complete your farmer profile."
            />

            <HowStep
              number="02"
              icon={<CalendarDays size={18} />}
              title="Book a slot"
              description="Choose a nearby centre and select a convenient time slot."
            />

            <HowStep
              number="03"
              icon={<QrCode size={18} />}
              title="Get your token"
              description="Receive a digital token and gate pass for your visit."
            />

            <HowStep
              number="04"
              icon={<CircleDollarSign size={18} />}
              title="Track & receive payment"
              description="Follow your queue and payment status from one place."
            />

          </div>
        </div>
      </section>

      {/* =====================================================
          LOGIN CTA
      ====================================================== */}

      <section
        id="help"
        className="bg-[#f1f8f3]"
      >

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">

          <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] border border-[#d3e8d9] bg-white p-6 sm:p-8 md:flex-row md:items-center">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#16803c]">
                Ready to get started?
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#123d25]">
                Book your procurement slot today.
              </h2>

              <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#718078]">
                Find a nearby procurement centre, choose your slot and receive
                your digital token.
              </p>

            </div>

            <Link
              href="/login"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#16803c] px-5 py-3 text-[11px] font-semibold text-white transition hover:bg-[#116b32]"
            >
              Login to KisanQueue
              <ArrowRight size={14} />
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#dce9df] bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9f8ee]">
              <Sprout
                size={17}
                className="text-[#16803c]"
              />
            </div>

            <div>

              <p className="text-[12px] font-bold text-[#17351f]">
                KisanQueue
              </p>

              <p className="text-[8px] text-[#829087]">
                Smart Procurement for Farmers
              </p>

            </div>

          </div>

          <p className="text-[9px] text-[#829087]">
            © 2026 KisanQueue. Government procurement queue platform.
          </p>

        </div>
      </footer>

    </main>
  );
}

/* =============================================================
   TRUST POINT
============================================================= */

function TrustPoint({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-[#718078]">
      <CheckCircle2
        size={12}
        className="text-[#16803c]"
      />

      {text}
    </div>
  );
}

/* =============================================================
   DASHBOARD METRIC
============================================================= */

function DashboardMetric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[10px] bg-white/10 p-3">

      <div className="flex items-center gap-1.5 text-[8px] text-[#c9dfd0]">
        {icon}
        {label}
      </div>

      <p className="mt-1 text-[17px] font-bold">
        {value}
      </p>

      <p className="text-[7px] text-[#a8c7b1]">
        {sub}
      </p>

    </div>
  );
}

/* =============================================================
   MINI METRIC
============================================================= */

function MiniMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-[#dce9df] bg-white px-2 py-2.5 text-center">

      <p className="text-[12px] font-bold text-[#17351f]">
        {value}
      </p>

      <p className="mt-0.5 text-[7px] text-[#829087]">
        {label}
      </p>

    </div>
  );
}

/* =============================================================
   KPI CARD
============================================================= */

function KpiCard({
  icon,
  value,
  suffix,
  label,
  iconClass,
}: {
  icon: React.ReactNode;
  value: string;
  suffix: string;
  label: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-3 border-r border-[#dce9df] px-4 py-5 last:border-r-0 sm:px-6">

      <div
        className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex ${iconClass}`}
      >
        {icon}
      </div>

      <div>

        <p className="text-lg font-bold text-[#17351f] sm:text-xl">
          {value}
          {suffix}
        </p>

        <p className="mt-0.5 text-[9px] text-[#718078]">
          {label}
        </p>

      </div>
    </div>
  );
}

/* =============================================================
   INFO PANEL
============================================================= */

function InfoPanel({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[17px] border border-[#dce9df] bg-white p-4 shadow-[0_5px_20px_rgba(22,74,40,0.03)]">

      <div className="flex items-start justify-between">

        <div className="flex gap-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf8ef] text-[#16803c]">
            {icon}
          </div>

          <div>

            <h3 className="text-[12px] font-bold text-[#17351f]">
              {title}
            </h3>

            <p className="mt-0.5 text-[8px] text-[#829087]">
              {subtitle}
            </p>

          </div>

        </div>

        <button
          type="button"
          className="text-[9px] font-semibold text-[#16803c]"
        >
          {action}
        </button>

      </div>

      <div className="mt-3">
        {children}
      </div>

    </div>
  );
}

/* =============================================================
   ACTIVITY DETAILS
============================================================= */

function getActivityDetails(
  eventType: string
) {
  switch (eventType) {

    case "token_issued":
      return {
        title: "Token issued",
        description:
          "A new procurement token was generated",
        icon: <CalendarDays size={16} />,
      };

    case "called":
      return {
        title: "Farmer called",
        description:
          "A farmer has been called for processing",
        icon: <Bell size={16} />,
      };

    case "gate_entered":
      return {
        title: "Gate entry recorded",
        description:
          "A farmer has entered the procurement centre",
        icon: <Building2 size={16} />,
      };

    case "weighing_started":
      return {
        title: "Weighment started",
        description:
          "Crop weighing is currently in progress",
        icon: <Wheat size={16} />,
      };

    case "weighing_completed":
      return {
        title: "Weighment completed",
        description:
          "Crop quantity has been recorded",
        icon: <CheckCircle2 size={16} />,
      };

    case "quality_started":
      return {
        title: "Quality inspection started",
        description:
          "Quality inspection is in progress",
        icon: <FileCheck2 size={16} />,
      };

    case "quality_completed":
      return {
        title: "Quality inspection completed",
        description:
          "Quality inspection has been recorded",
        icon: <CheckCircle2 size={16} />,
      };

    case "bagging_started":
      return {
        title: "Bagging started",
        description:
          "Procurement material is being prepared",
        icon: <Wheat size={16} />,
      };

    case "storage_started":
      return {
        title: "Storage processing started",
        description:
          "Procurement material is moving to storage",
        icon: <Building2 size={16} />,
      };

    case "offloading_started":
      return {
        title: "Offloading started",
        description:
          "Offloading activity is in progress",
        icon: <Wheat size={16} />,
      };

    case "completed":
      return {
        title: "Procurement completed",
        description:
          "A procurement transaction has been completed",
        icon: <CheckCircle2 size={16} />,
      };

    default:
      return {
        title: "Procurement activity",
        description:
          "A procurement centre activity was recorded",
        icon: <BarChart3 size={16} />,
      };
  }
}

/* =============================================================
   ACTIVITY TIME
============================================================= */

function formatActivityTime(
  timestamp: string
) {
  const diffMs =
    Date.now() -
    new Date(timestamp).getTime();

  const diffMinutes = Math.max(
    0,
    Math.floor(diffMs / 60000)
  );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(
    diffMinutes / 60
  );

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(
    diffHours / 24
  );

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

/* =============================================================
   ACTIVITY ROW
============================================================= */

function ActivityRow({
  icon,
  title,
  description,
  time,
  live,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#edf2ee] py-3 last:border-b-0">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef9f1] text-[#16803c]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-semibold text-[#355043]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[8px] text-[#829087]">
          {description}
        </p>

      </div>

      {live ? (
        <span className="flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2 py-1 text-[7px] font-semibold text-[#16803c]">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16803c]" />

          Live

        </span>
      ) : (
        <span className="shrink-0 text-[8px] text-[#9aa59f]">
          {time}
        </span>
      )}

    </div>
  );
}

/* =============================================================
   HOW IT WORKS
============================================================= */

function HowStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-[15px] border border-[#dce9df] bg-[#fbfdfb] p-4">

      <div className="flex items-start justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf8ef] text-[#16803c]">
          {icon}
        </div>

        <span className="text-2xl font-bold text-[#e0e9e3]">
          {number}
        </span>

      </div>

      <h3 className="mt-4 text-[11px] font-bold text-[#17351f]">
        {title}
      </h3>

      <p className="mt-1 text-[9px] leading-4 text-[#718078]">
        {description}
      </p>

    </div>
  );
}