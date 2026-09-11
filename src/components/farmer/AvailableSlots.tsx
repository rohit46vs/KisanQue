"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import BookSlotButton from "@/components/farmer/BookSlotButton";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Loader2,
  Scale,
  Sprout,
} from "lucide-react";

type Slot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_active: boolean;
};

type AvailableSlotsProps = {
  slots: Slot[];
};

type Profile = {
  state: string | null;
};

type Commodity = {
  id: string;
  name: string;
  code: string;
  category: string;
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

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    day: date.toLocaleDateString("en-IN", {
      day: "numeric",
    }),
    month: date.toLocaleDateString("en-IN", {
      month: "short",
    }),
    weekday: date.toLocaleDateString("en-IN", {
      weekday: "short",
    }),
  };
}

function formatTime(time: string) {
  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeState(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export default function AvailableSlots({
  slots,
}: AvailableSlotsProps) {
  const supabase = createClient();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [commodities, setCommodities] =
    useState<Commodity[]>([]);

  const [prices, setPrices] =
    useState<ProcurementPrice[]>([]);

  const [selectedCommodityId, setSelectedCommodityId] =
    useState("");

  const [quantityInput, setQuantityInput] =
    useState("");

  const [loadingBookingOptions, setLoadingBookingOptions] =
    useState(true);

  const [bookingOptionsError, setBookingOptionsError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookingOptions() {
      try {
        setLoadingBookingOptions(true);
        setBookingOptionsError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "Unable to load your account."
          );
        }

        const [
          profileResult,
          commodityResult,
          priceResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("state")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("commodities")
            .select(
              "id, name, code, category"
            )
            .eq("is_active", true)
            .order("name", {
              ascending: true,
            }),

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
            .order("effective_from", {
              ascending: false,
            }),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        if (commodityResult.error) {
          throw commodityResult.error;
        }

        if (priceResult.error) {
          throw priceResult.error;
        }

        if (cancelled) {
          return;
        }

        const loadedProfile =
          (profileResult.data ??
            null) as Profile | null;

        const loadedCommodities =
          (commodityResult.data ??
            []) as Commodity[];

        const loadedPrices =
          (priceResult.data ??
            []) as ProcurementPrice[];

        setProfile(loadedProfile);
        setCommodities(loadedCommodities);
        setPrices(loadedPrices);

        /*
         * Prefer a crop that has a current price for
         * the farmer's state. This prevents the farmer
         * from initially landing on an unavailable crop.
         */
        const farmerState = normalizeState(
          loadedProfile?.state
        );

        const today =
          new Date()
            .toISOString()
            .slice(0, 10);

        const pricedCommodityIds =
          new Set(
            loadedPrices
              .filter((price) => {
                if (
                  normalizeState(
                    price.state_name
                  ) !== farmerState
                ) {
                  return false;
                }

                if (!price.is_active) {
                  return false;
                }

                if (
                  price.effective_from > today
                ) {
                  return false;
                }

                if (
                  price.effective_to &&
                  price.effective_to < today
                ) {
                  return false;
                }

                return price.price_per_qtl > 0;
              })
              .map(
                (price) =>
                  price.commodity_id
              )
          );

        const firstPricedCommodity =
          loadedCommodities.find((commodity) =>
            pricedCommodityIds.has(
              commodity.id
            )
          );

        if (firstPricedCommodity) {
          setSelectedCommodityId(
            firstPricedCommodity.id
          );
        }
      } catch (error) {
        console.error(
          "Load booking options error:",
          error
        );

        if (!cancelled) {
          setBookingOptionsError(
            "Unable to load crop and procurement price information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBookingOptions(false);
        }
      }
    }

    loadBookingOptions();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const availableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.is_active &&
          slot.capacity - slot.booked_count > 0
      ),
    [slots]
  );

  const availableDates = useMemo(() => {
    const dates = Array.from(
      new Set(
        availableSlots.map(
          (slot) => slot.slot_date
        )
      )
    );

    return dates.sort();
  }, [availableSlots]);

  const [selectedDate, setSelectedDate] =
    useState("");

  useEffect(() => {
    if (
      availableDates.length === 0
    ) {
      setSelectedDate("");
      return;
    }

    setSelectedDate((current) => {
      if (
        current &&
        availableDates.includes(current)
      ) {
        return current;
      }

      return availableDates[0];
    });
  }, [availableDates]);

  const selectedSlots = useMemo(
    () =>
      availableSlots
        .filter(
          (slot) =>
            slot.slot_date === selectedDate
        )
        .sort((a, b) =>
          a.start_time.localeCompare(
            b.start_time
          )
        ),
    [availableSlots, selectedDate]
  );

  const currentPrice = useMemo(() => {
    if (
      !selectedCommodityId ||
      !profile?.state
    ) {
      return null;
    }

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const matchingPrices = prices
      .filter((price) => {
        if (
          price.commodity_id !==
          selectedCommodityId
        ) {
          return false;
        }

        if (
          normalizeState(
            price.state_name
          ) !==
          normalizeState(profile.state)
        ) {
          return false;
        }

        if (!price.is_active) {
          return false;
        }

        if (
          price.effective_from > today
        ) {
          return false;
        }

        if (
          price.effective_to &&
          price.effective_to < today
        ) {
          return false;
        }

        return price.price_per_qtl > 0;
      })
      .sort((a, b) => {
        if (
          a.effective_from !==
          b.effective_from
        ) {
          return b.effective_from.localeCompare(
            a.effective_from
          );
        }

        return b.id.localeCompare(a.id);
      });

    return matchingPrices[0] ?? null;
  }, [
    prices,
    profile?.state,
    selectedCommodityId,
  ]);

  const selectedCommodity = useMemo(
    () =>
      commodities.find(
        (commodity) =>
          commodity.id ===
          selectedCommodityId
      ) ?? null,
    [commodities, selectedCommodityId]
  );

  const estimatedQuantityQtl = useMemo(() => {
    if (!quantityInput.trim()) {
      return null;
    }

    const value = Number(
      quantityInput
    );

    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      value > 1000
    ) {
      return null;
    }

    return value;
  }, [quantityInput]);

  const estimatedValue = useMemo(() => {
    if (
      estimatedQuantityQtl === null ||
      !currentPrice
    ) {
      return null;
    }

    return (
      estimatedQuantityQtl *
      Number(currentPrice.price_per_qtl)
    );
  }, [
    currentPrice,
    estimatedQuantityQtl,
  ]);

  const pricedCommodityIds = useMemo(() => {
    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const farmerState =
      normalizeState(profile?.state);

    return new Set(
      prices
        .filter((price) => {
          if (
            normalizeState(
              price.state_name
            ) !== farmerState
          ) {
            return false;
          }

          if (!price.is_active) {
            return false;
          }

          if (
            price.effective_from > today
          ) {
            return false;
          }

          if (
            price.effective_to &&
            price.effective_to < today
          ) {
            return false;
          }

          return price.price_per_qtl > 0;
        })
        .map(
          (price) => price.commodity_id
        )
    );
  }, [prices, profile?.state]);

  if (availableSlots.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium">
          No slots are currently available.
        </p>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Please check again later or choose
          another procurement centre.
        </p>
      </Card>
    );
  }

  return (
    <div>
      {/* Booking options */}
      <Card className="border-[var(--color-primary)]/20 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--color-primary-light)] p-2.5">
            <Sprout
              size={22}
              className="text-[var(--color-primary)]"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Crop & Quantity
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Select what you are bringing and
              enter your estimated quantity.
            </p>
          </div>
        </div>

        {loadingBookingOptions ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Loader2
              size={17}
              className="animate-spin"
            />
            Loading crops and current rates...
          </div>
        ) : bookingOptionsError ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {bookingOptionsError}
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="booking-crop"
                className="mb-2 block text-sm font-semibold"
              >
                Crop
              </label>

              <select
                id="booking-crop"
                value={selectedCommodityId}
                onChange={(event) =>
                  setSelectedCommodityId(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              >
                <option value="">
                  Select crop
                </option>

                {commodities.map(
                  (commodity) => (
                    <option
                      key={commodity.id}
                      value={commodity.id}
                      disabled={
                        !pricedCommodityIds.has(
                          commodity.id
                        )
                      }
                    >
                      {commodity.name}
                      {!pricedCommodityIds.has(
                        commodity.id
                      )
                        ? " — price not configured"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            {selectedCommodity && (
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Selected Crop
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {selectedCommodity.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      Code:{" "}
                      {selectedCommodity.code}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                    {selectedCommodity.category}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="estimated-quantity"
                className="mb-2 block text-sm font-semibold"
              >
                Estimated Quantity
              </label>

              <div className="relative">
                <Scale
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="estimated-quantity"
                  type="number"
                  min="0.01"
                  max="1000"
                  step="0.01"
                  inputMode="decimal"
                  value={quantityInput}
                  onChange={(event) =>
                    setQuantityInput(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 25"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white py-3 pl-11 pr-16 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                  QTL
                </span>
              </div>

              <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                Enter an estimate between 0.01
                and 1000 QTL.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                currentPrice
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      currentPrice
                        ? "text-green-700"
                        : "text-amber-700"
                    }`}
                  >
                    Current Procurement Rate
                  </p>

                  {currentPrice ? (
                    <>
                      <p className="mt-1 text-2xl font-bold text-green-900">
                        {formatCurrency(
                          Number(
                            currentPrice.price_per_qtl
                          )
                        )}
                        <span className="ml-1 text-sm font-medium">
                          / QTL
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-green-700">
                        {profile?.state}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 font-semibold text-amber-900">
                      Price not configured
                    </p>
                  )}
                </div>

                {currentPrice && (
                  <CheckCircle2
                    size={22}
                    className="text-green-600"
                  />
                )}
              </div>

              {!currentPrice &&
                selectedCommodityId && (
                  <p className="mt-2 text-xs text-amber-800">
                    This crop cannot currently be
                    booked because an active rate
                    has not been configured for
                    your state.
                  </p>
                )}
            </div>

            {estimatedValue !== null && (
              <div className="rounded-2xl bg-[var(--color-primary-light)] p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
                  Estimated Procurement Value
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(
                    estimatedValue
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {estimatedQuantityQtl} QTL ×{" "}
                  {formatCurrency(
                    Number(
                      currentPrice?.price_per_qtl ??
                        0
                    )
                  )}{" "}
                  / QTL
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  This is an estimate. Final
                  procurement value is determined
                  from the actual accepted quantity
                  and applicable procurement price.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Date selector */}
      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Select a date
            </p>

            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Showing the first available date by
              default.
            </p>
          </div>

          <span className="text-xs font-medium text-[var(--color-primary)]">
            {availableDates.length} dates
            available
          </span>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {availableDates.map((date) => {
            const formatted =
              formatDate(date);

            const isSelected =
              date === selectedDate;

            const dateSlotCount =
              availableSlots.filter(
                (slot) =>
                  slot.slot_date === date
              ).length;

            return (
              <button
                key={date}
                type="button"
                onClick={() =>
                  setSelectedDate(date)
                }
                className={`min-w-[92px] rounded-xl border px-3 py-3 text-left transition ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isSelected
                      ? "text-white/80"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {formatted.weekday}
                </p>

                <p className="mt-0.5 text-lg font-bold">
                  {formatted.day}
                </p>

                <p
                  className={`text-xs ${
                    isSelected
                      ? "text-white/80"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {formatted.month}
                </p>

                <p
                  className={`mt-2 text-[10px] font-medium ${
                    isSelected
                      ? "text-white/80"
                      : "text-[var(--color-primary)]"
                  }`}
                >
                  {dateSlotCount} time slots
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date / slots */}
      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">
              Available times
            </h3>

            {selectedDate && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                {formatDate(selectedDate).weekday},{" "}
                {formatDate(selectedDate).day}{" "}
                {formatDate(selectedDate).month}
              </p>
            )}
          </div>

          <p className="text-xs font-medium text-[var(--color-primary)]">
            {selectedSlots.length} slots available
          </p>
        </div>

        {selectedSlots.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="font-medium">
              No available times for this date.
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Please select another date.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedSlots.map((slot) => {
              const remaining =
                slot.capacity -
                slot.booked_count;

              const isFull =
                remaining <= 0;

              return (
                <Card
                  key={slot.id}
                  hover={!isFull}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Time
                      </p>

                      <h4 className="mt-1 text-lg font-bold">
                        {formatTime(
                          slot.start_time
                        )}{" "}
                        –{" "}
                        {formatTime(
                          slot.end_time
                        )}
                      </h4>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isFull
                          ? "bg-red-50 text-red-700"
                          : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      }`}
                    >
                      {isFull
                        ? "Full"
                        : `${remaining} left`}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {slot.booked_count} /{" "}
                        {slot.capacity} booked
                      </span>

                      {selectedCommodity &&
                        currentPrice && (
                          <span className="text-xs font-medium text-green-700">
                            {selectedCommodity.name}
                          </span>
                        )}
                    </div>

                    <div className="flex justify-end">
                      <BookSlotButton
                        slotId={slot.id}
                        commodityId={
                          currentPrice
                            ? selectedCommodityId
                            : ""
                        }
                        estimatedQuantityQtl={
                          currentPrice
                            ? estimatedQuantityQtl
                            : null
                        }
                        disabled={isFull}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}