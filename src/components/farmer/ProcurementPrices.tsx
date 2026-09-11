"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  RefreshCw,
  Wheat,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Commodity = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
};

type ProcurementPrice = {
  id: string;
  commodity_id: string;
  state_name: string;
  price_per_qtl: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
};

type ProcurementPricesProps = {
  farmerState: string | null;
};

const STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function normalizeState(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProcurementPrices({
  farmerState,
}: ProcurementPricesProps) {
  const supabase = createClient();

  const [selectedState, setSelectedState] = useState(
    farmerState?.trim() || "Punjab"
  );

  const [prices, setPrices] = useState<ProcurementPrice[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFarmerState =
    normalizeState(selectedState) === normalizeState(farmerState);

  async function loadPrices(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [pricesResult, commoditiesResult] = await Promise.all([
        supabase
          .from("procurement_prices")
          .select(
            `
              id,
              commodity_id,
              state_name,
              price_per_qtl,
              effective_from,
              effective_to,
              is_active
            `
          )
          .eq("is_active", true)
          .order("state_name", { ascending: true }),

        supabase
          .from("commodities")
          .select("id, name, code, category")
          .eq("is_active", true)
          .order("name", { ascending: true }),
      ]);

      if (pricesResult.error) {
        throw pricesResult.error;
      }

      if (commoditiesResult.error) {
        throw commoditiesResult.error;
      }

      setPrices((pricesResult.data ?? []) as ProcurementPrice[]);
      setCommodities((commoditiesResult.data ?? []) as Commodity[]);
    } catch (err) {
      console.error("Load procurement prices error:", err);
      setError(
        "Unable to load procurement prices right now. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setSelectedState(farmerState?.trim() || "Punjab");
  }, [farmerState]);

  useEffect(() => {
    loadPrices();
    // The pricing data is intentionally loaded once when the dashboard opens.
    // The refresh button lets the farmer request the latest active rates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commodityMap = useMemo(
    () =>
      new Map(
        commodities.map((commodity) => [commodity.id, commodity])
      ),
    [commodities]
  );

  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  const statePrices = useMemo(() => {
    return prices
      .filter(
        (price) =>
          normalizeState(price.state_name) ===
          normalizeState(selectedState)
      )
      .filter((price) => {
        const starts =
          !price.effective_from ||
          price.effective_from <= todayString;

        const ends =
          !price.effective_to ||
          price.effective_to >= todayString;

        return starts && ends;
      })
      .sort((a, b) => {
        const commodityA =
          commodityMap.get(a.commodity_id)?.name ?? "";
        const commodityB =
          commodityMap.get(b.commodity_id)?.name ?? "";

        return commodityA.localeCompare(commodityB);
      });
  }, [
    prices,
    selectedState,
    commodityMap,
    todayString,
  ]);

  const availableStates = useMemo(() => {
    const configuredStates = new Set(
      prices
        .filter((price) => price.is_active)
        .map((price) => price.state_name.trim())
    );

    const allStates = new Set([
      ...STATES_AND_UTS,
      ...configuredStates,
    ]);

    return Array.from(allStates).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [prices]);

  return (
    <section className="mt-8 overflow-hidden rounded-[22px] border border-[#d7e9dc] bg-white shadow-[0_8px_30px_rgba(22,74,40,0.05)]">
      {/* Header */}
      <div className="border-b border-[#e4eee7] bg-gradient-to-r from-[#f1faf4] to-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f7eb] text-[#16803c]">
                <IndianRupee size={19} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#16803c]">
                  Procurement Prices
                </p>

                <h2 className="mt-0.5 text-lg font-bold text-[#123d25] sm:text-xl">
                  Current crop rates
                </h2>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-xs leading-5 text-[#718078]">
              See the active procurement rate for each crop. Your
              state is selected automatically from your farmer profile.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPrices(true)}
            disabled={loading || refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#cfe2d4] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#52645a] transition hover:border-[#9fc8aa] hover:bg-[#f5fbf7] hover:text-[#16803c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Refresh
          </button>
        </div>

        {/* State selector */}
        <div className="mt-5 rounded-xl border border-[#dce9df] bg-white p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-[#16803c]" />

              <label
                htmlFor="farmer-price-state"
                className="text-[11px] font-semibold text-[#52645a]"
              >
                Price State / UT
              </label>
            </div>

            <select
              id="farmer-price-state"
              value={selectedState}
              onChange={(event) =>
                setSelectedState(event.target.value)
              }
              className="min-w-0 flex-1 rounded-lg border border-[#d8e5dc] bg-white px-3 py-2.5 text-xs font-medium text-[#17351f] outline-none transition focus:border-[#16803c] focus:ring-2 focus:ring-[#16803c]/10 sm:max-w-[360px]"
            >
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                  {normalizeState(state) ===
                  normalizeState(farmerState)
                    ? " — Your State"
                    : ""}
                </option>
              ))}
            </select>

            {isFarmerState && farmerState && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#eaf8ef] px-2.5 py-1.5 text-[9px] font-bold text-[#16803c]">
                <CheckCircle2 size={11} />
                Your state
              </span>
            )}
          </div>

          {!isFarmerState && farmerState && (
            <p className="mt-2 text-[10px] leading-4 text-[#718078]">
              You are viewing prices for another State / UT. Change
              the selector back to{" "}
              <span className="font-semibold text-[#52645a]">
                {farmerState}
              </span>{" "}
              to see your local rate.
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[118px] animate-pulse rounded-2xl border border-[#e1ebe4] bg-[#f7faf8]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm font-semibold text-red-800">
              Unable to load prices
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadPrices()}
              className="mt-4 rounded-lg bg-[#16803c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#116b32]"
            >
              Try Again
            </button>
          </div>
        ) : statePrices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cfe2d4] bg-[#f8fcf9] p-7 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf8ef] text-[#16803c]">
              <Wheat size={21} />
            </div>

            <h3 className="mt-3 text-sm font-bold text-[#17351f]">
              No active prices available
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#718078]">
              No current procurement rates have been published for{" "}
              <span className="font-semibold text-[#52645a]">
                {selectedState}
              </span>{" "}
              yet.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-[#52645a]">
                  {selectedState}
                </p>

                <p className="text-[10px] text-[#89958e]">
                  Active rates currently published
                </p>
              </div>

              <span className="text-[10px] font-medium text-[#718078]">
                {statePrices.length}{" "}
                {statePrices.length === 1 ? "crop" : "crops"} available
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {statePrices.map((price) => {
                const commodity =
                  commodityMap.get(price.commodity_id);

                return (
                  <div
                    key={price.id}
                    className="group rounded-2xl border border-[#dce9df] bg-white p-4 transition hover:border-[#a9cfb4] hover:bg-[#fbfefc] hover:shadow-[0_8px_25px_rgba(22,74,40,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf8ef] text-[#16803c]">
                          <Wheat size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#17351f]">
                            {commodity?.name ??
                              "Unknown Commodity"}
                          </h3>

                          {commodity?.code && (
                            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-[#89958e]">
                              {commodity.code}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eaf8ef] px-2 py-1 text-[8px] font-bold text-[#16803c]">
                        <CheckCircle2 size={9} />
                        Active
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-[#f4faf6] px-3.5 py-3">
                      <p className="text-[9px] font-medium uppercase tracking-wide text-[#718078]">
                        Procurement rate
                      </p>

                      <p className="mt-1 text-xl font-bold tracking-tight text-[#123d25]">
                        {formatCurrency(
                          Number(price.price_per_qtl)
                        )}
                        <span className="ml-1 text-[10px] font-semibold text-[#718078]">
                          / QTL
                        </span>
                      </p>
                    </div>

                    <p className="mt-3 text-[9px] text-[#89958e]">
                      Effective from{" "}
                      <span className="font-semibold text-[#718078]">
                        {formatDate(price.effective_from)}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex gap-2 rounded-xl bg-[#f7faf8] px-3.5 py-3">
              <IndianRupee
                size={14}
                className="mt-0.5 shrink-0 text-[#16803c]"
              />

              <p className="text-[10px] leading-4 text-[#718078]">
                Rates shown here are published procurement rates.
                Your final payment is calculated using the applicable
                rate and the actual quantity accepted during
                procurement.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}