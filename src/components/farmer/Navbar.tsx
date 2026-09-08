"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, LogOut, User } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type UserData = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
};

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Farmer";

  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              🌱
            </div>

            <span className="text-lg font-bold">
              Kisan<span className="text-[var(--color-primary)]">Queue</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/#how-it-works"
              className="text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
              How it works
            </Link>

            <Link
              href="/#features"
              className="text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
              Features
            </Link>

            <Link
              href="/#languages"
              className="text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
            >
              Languages
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden items-center gap-1 text-sm text-[var(--color-text-secondary)] sm:flex"
            >
              <Globe size={16} />
              हिन्दी
            </button>

            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-xl bg-[var(--color-surface-muted)]" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 sm:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <User size={15} />
                  </div>

                  <span className="max-w-32 truncate text-sm font-medium">
                    {displayName}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}