import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          variant === "primary" &&
            "bg-green-700 text-white hover:bg-green-800 active:scale-[0.98]",

          variant === "secondary" &&
            "bg-green-50 text-green-800 hover:bg-green-100",

          variant === "outline" &&
            "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",

          variant === "danger" &&
            "bg-red-600 text-white hover:bg-red-700",

          variant === "ghost" &&
            "text-gray-700 hover:bg-gray-100",

          size === "sm" && "min-h-9 px-3 text-sm",
          size === "md" && "min-h-11 px-5 text-sm",
          size === "lg" && "min-h-12 px-6 text-base",

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };