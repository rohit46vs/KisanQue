"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setLoading(false);
      alert("Unable to start Google login. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <Card className="p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)]">
                <span className="text-2xl">🌾</span>
              </div>

              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Welcome to KisanQueue
              </h1>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Sign in to book your procurement slot and manage your token.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Connecting...
                </>
              ) : (
                <>
                 <LogIn size={18} />
                  Continue with Google
                </>
              )}
            </Button>

            <p className="mt-6 text-center text-xs leading-5 text-[var(--color-text-muted)]">
              By continuing, you agree to the KisanQueue terms and privacy
              policy.
            </p>
          </Card>
        </div>
      </Container>
    </main>
  );
}