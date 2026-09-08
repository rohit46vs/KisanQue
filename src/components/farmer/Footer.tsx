import Link from "next/link";
import { Sprout } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container>
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-white">
                <Sprout size={19} />
              </div>

              <span className="text-lg font-bold text-gray-900">
                Kisan<span className="text-green-700">Queue</span>
              </span>
            </Link>

            <p className="mt-3 text-sm text-gray-500">
              Making procurement visits simpler for farmers.
            </p>
          </div>

          <div className="flex gap-5 text-sm text-gray-500">
            <Link href="/help" className="hover:text-green-700">
              Help
            </Link>

            <Link href="/privacy" className="hover:text-green-700">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-green-700">
              Terms
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 py-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} KisanQueue. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}