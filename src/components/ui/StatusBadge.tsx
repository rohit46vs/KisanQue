import { cn } from "@/lib/utils/cn";

type Status =
  | "booked"
  | "waiting"
  | "called"
  | "arrived"
  | "inspected"
  | "accepted"
  | "rejected"
  | "payment"
  | "completed"
  | "skipped";

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  booked: {
    label: "Booked",
    className: "bg-blue-50 text-blue-700",
  },
  waiting: {
    label: "Waiting",
    className: "bg-amber-50 text-amber-700",
  },
  called: {
    label: "Called",
    className: "bg-purple-50 text-purple-700",
  },
  arrived: {
    label: "Arrived",
    className: "bg-cyan-50 text-cyan-700",
  },
  inspected: {
    label: "Inspected",
    className: "bg-indigo-50 text-indigo-700",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-50 text-green-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700",
  },
  payment: {
    label: "Payment",
    className: "bg-orange-50 text-orange-700",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800",
  },
  skipped: {
    label: "Skipped",
    className: "bg-gray-100 text-gray-700",
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}