import Link from "next/link";
import { Globe2, Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="KisanQueue Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-white">
              <Sprout size={20} />
            </div>

            <div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Kisan
              </span>
              <span className="text-lg font-bold tracking-tight text-green-700">
                Queue
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition hover:text-green-700"
            >
              How it works
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition hover:text-green-700"
            >
              Features
            </a>

            <a
              href="#languages"
              className="text-sm font-medium text-gray-600 transition hover:text-green-700"
            >
              Languages
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:flex"
            >
              <Globe2 size={17} />
              हिन्दी
            </button>

            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}