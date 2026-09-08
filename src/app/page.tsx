import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function Home() {
  return (
    <main className="min-h-screen py-12">
      <Container>
        <div className="space-y-8">
          <div>
            <p className="text-sm font-medium text-green-700">
              KisanQueue Design System
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Procurement made simpler.
            </h1>

            <p className="mt-3 max-w-xl text-gray-600">
              Book a slot, get your token and track your queue
              without waiting unnecessarily.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button>Find Centre</Button>

            <Button variant="outline">
              View Booking
            </Button>

            <Button variant="secondary">
              Learn More
            </Button>

            <Button variant="danger">
              Cancel Booking
            </Button>
          </div>

          <Card className="max-w-md p-6" hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Your Token
                </p>

                <p className="mt-1 text-4xl font-bold text-green-700">
                  A-127
                </p>
              </div>

              <StatusBadge status="waiting" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-xs text-gray-500">
                  Farmers Ahead
                </p>
                <p className="mt-1 font-semibold">7</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Estimated Wait
                </p>
                <p className="mt-1 font-semibold">35 min</p>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}