import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalFarmers: number;
  totalQuantity: number;
  activeCentres: number;
  activeBookings: number;
};

export type PublicActivity = {
  eventType: string;
  tokenNumber: string | null;
  centreName: string;
  state: string;
  occurredAt: string;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_public_dashboard_stats"
  );

  if (error) {
    console.error(
      "Failed to load dashboard stats:",
      error
    );

    return {
      totalFarmers: 0,
      totalQuantity: 0,
      activeCentres: 0,
      activeBookings: 0,
    };
  }

  const result = data?.[0];

  return {
    totalFarmers: Number(
      result?.total_farmers ?? 0
    ),
    totalQuantity: Number(
      result?.total_quantity ?? 0
    ),
    activeCentres: Number(
      result?.active_centres ?? 0
    ),
    activeBookings: Number(
      result?.active_bookings ?? 0
    ),
  };
}

export async function getPublicActivity(): Promise<
  PublicActivity[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_public_activity"
  );

  if (error) {
    console.error(
      "Failed to load public activity:",
      error
    );

    return [];
  }

  return (data ?? []).map(
    (row: {
      event_type: string;
      token_number: string | null;
      centre_name: string;
      state: string;
      occurred_at: string;
    }) => ({
      eventType: row.event_type,
      tokenNumber: row.token_number,
      centreName: row.centre_name,
      state: row.state,
      occurredAt: row.occurred_at,
    })
  );
}