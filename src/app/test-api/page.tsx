"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function TestApiPage() {
  const supabase = createClient();

  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function getSessionToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session?.access_token) {
      throw new Error(
        "No active login session found."
      );
    }

    return session.access_token;
  }

  async function testMyBooking() {
    setLoading(true);
    setResult(null);

    try {
      const token = await getSessionToken();

      const response = await fetch(
        `${API_URL}/api/bookings/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setResult({
        endpoint: "GET /api/bookings/me",
        httpStatus: response.status,
        response: data,
      });
    } catch (error) {
      setResult({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function testMyQueue() {
    setLoading(true);
    setResult(null);

    try {
      const token = await getSessionToken();

      const response = await fetch(
        `${API_URL}/api/queue/my-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setResult({
        endpoint: "GET /api/queue/my-status",
        httpStatus: response.status,
        response: data,
      });
    } catch (error) {
      setResult({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold">
          API Test
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Temporary testing page for KisanQueue API.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={testMyBooking}
            disabled={loading}
            className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Get My Booking
          </button>

          <button
            type="button"
            onClick={testMyQueue}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Get My Queue
          </button>
        </div>

        {result !== null && (
          <pre className="mt-6 overflow-auto rounded-xl bg-gray-100 p-5 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}