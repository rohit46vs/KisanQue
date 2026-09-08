import {
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Ticket,
  Wheat,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Choose a centre",
    description:
      "Find a nearby procurement centre and check its current queue.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book a slot",
    description:
      "Select an available date and time that works for you.",
  },
  {
    number: "03",
    icon: Ticket,
    title: "Get your token",
    description:
      "Receive a unique digital token and see your position in the queue.",
  },
  {
    number: "04",
    icon: Wheat,
    title: "Visit when needed",
    description:
      "Follow live updates and approach the centre when your turn is near.",
  },
  {
    number: "05",
    icon: CheckCircle2,
    title: "Track your payment",
    description:
      "Follow procurement and payment status after your visit.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Five simple steps.
          </h2>

          <p className="mt-4 text-gray-600">
            The entire process is designed to be easy to understand,
            even if you are using a digital service for the first time.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-green-700">
                    {step.number}
                  </span>

                  <Icon size={21} className="text-green-700" />
                </div>

                <h3 className="mt-7 font-semibold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}