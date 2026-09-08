import {
  BellRing,
  CircleDollarSign,
  Clock3,
  Ticket,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const features = [
  {
    icon: Ticket,
    title: "Digital Token",
    description:
      "Get your queue token digitally after booking your procurement slot.",
  },
  {
    icon: Clock3,
    title: "Live Queue",
    description:
      "See your current position and estimated waiting time in real time.",
  },
  {
    icon: CircleDollarSign,
    title: "Payment Tracking",
    description:
      "Track procurement progress and see when your payment is processed.",
  },
  {
    icon: BellRing,
    title: "Timely Alerts",
    description:
      "Receive alerts when your turn is approaching or your status changes.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-gray-50 py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Everything in one place
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            A simpler way to manage your visit
          </h2>

          <p className="mt-4 text-gray-600">
            From booking your slot to receiving payment, KisanQueue
            keeps the important information in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}