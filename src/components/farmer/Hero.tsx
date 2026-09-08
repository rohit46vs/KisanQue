import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-green-50 blur-3xl" />

      <Container>
        <div className="grid min-h-[680px] items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800">
              <CheckCircle2 size={16} />
              Simple. Digital. Farmer-first.
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
              Skip the wait.
              <br />
              <span className="text-green-700">Know your turn.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600 sm:text-xl">
              Book a procurement slot, get your digital token and track
              your queue from your phone — without unnecessary waiting
              at the centre.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/centres">
                <Button size="lg" className="w-full sm:w-auto">
                  <MapPin size={19} />
                  Find a Procurement Centre
                  <ArrowRight size={18} />
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Login to your account
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-700" />
                No unnecessary waiting
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-700" />
                Live queue updates
              </div>
            </div>
          </div>

          {/* Token preview */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-green-50" />

            <div className="relative rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Your queue
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-gray-900">
                    Grain Procurement Centre
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <Ticket size={22} />
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-green-50 p-6 text-center">
                <p className="text-sm font-medium text-green-800">
                  YOUR TOKEN
                </p>

                <p className="mt-2 text-6xl font-bold tracking-tight text-green-700">
                  A-127
                </p>

                <div className="mt-4 flex justify-center">
                  <StatusBadge status="waiting" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Ticket size={16} />
                    <span className="text-xs">Ahead</span>
                  </div>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    7 farmers
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock3 size={16} />
                    <span className="text-xs">Est. wait</span>
                  </div>

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    ~35 min
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-green-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
                Queue is updating live
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}