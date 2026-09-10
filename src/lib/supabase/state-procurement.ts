import { createClient } from "@/lib/supabase/server";

export type StateProcurement = {
  state: string;
  farmers: number;
  quantityQtl: number;
  quantityMt: number;
  procurementCentres: number;
};

export async function getStateProcurement(): Promise<
  StateProcurement[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_public_state_procurement"
  );

  if (error) {
    console.error(
      "Failed to load state procurement data:",
      error
    );

    return [];
  }

  return (data ?? []).map(
    (row: {
      state: string;
      farmers: number | string;
      quantity_qtl: number | string;
      procurement_centres: number | string;
    }) => {
      const quantityQtl = Number(
        row.quantity_qtl ?? 0
      );

      return {
        state: row.state,
        farmers: Number(row.farmers ?? 0),
        quantityQtl,
        quantityMt: quantityQtl / 10,
        procurementCentres: Number(
          row.procurement_centres ?? 0
        ),
      };
    }
  );
}