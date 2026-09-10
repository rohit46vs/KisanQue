"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Loader2, Package, Scale } from "lucide-react";
import BookSlotButton from "@/components/farmer/BookSlotButton";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

type Slot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_active: boolean;
};

type Commodity = {
  id: string;
  name: string;
  code: string;
  category: string;
  storage_requirement: string;
  is_active: boolean;
};

type AvailableSlotsProps = {
  slots: Slot[];
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

export default function AvailableSlots({
  slots,
}: AvailableSlotsProps) {
  const supabase = createClient();

  const [commodities, setCommodities] =
    useState<Commodity[]>([]);

  const [selectedCommodityId, setSelectedCommodityId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [commodityLoading, setCommodityLoading] =
    useState(true);

  const [commodityError, setCommodityError] =
    useState<string | null>(null);

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
    useState(availableDates[0] ?? "");

  useEffect(() => {
    if (
      availableDates.length > 0 &&
      !availableDates.includes(selectedDate)
    ) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    async function loadCommodities() {
      try {
        setCommodityLoading(true);
        setCommodityError(null);

        const { data, error } =
          await supabase
            .from("commodities")
            .select(
              `
              id,
              name,
              code,
              category,
              storage_requirement,
              is_active
              `
            )
            .eq("is_active", true)
            .order("name", {
              ascending: true,
            });

        if (error) {
          throw error;
        }

        setCommodities(data ?? []);

        if (data && data.length > 0) {
          setSelectedCommodityId(
            data[0].id
          );
        }
      } catch (error) {
        console.error(
          "Failed to load commodities:",
          error
        );

        setCommodityError(
          "Unable to load crop types. Please refresh the page and try again."
        );
      } finally {
        setCommodityLoading(false);
      }
    }

    loadCommodities();
  }, [supabase]);

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

  const selectedQuantity = Number(quantity);

  const quantityIsValid =
    quantity.trim() !== "" &&
    Number.isFinite(selectedQuantity) &&
    selectedQuantity > 0 &&
    selectedQuantity <= 1000;

  const bookingReady =
    Boolean(selectedCommodityId) &&
    quantityIsValid;

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
      {/* Crop and quantity */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            What are you bringing?
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Select the crop you want to sell and
            enter your estimated quantity.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Crop */}
          <div>
            <label
              htmlFor="booking-crop"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-800"
            >
              <Package
                size={17}
                className="text-[var(--color-primary)]"
              />
              Crop type
            </label>

            {commodityLoading ? (
              <div className="flex h-12 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-gray-50 px-4 text-sm text-gray-500">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Loading crop types...
              </div>
            ) : commodityError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {commodityError}
              </div>
            ) : (
              <select
                id="booking-crop"
                value={selectedCommodityId}
                onChange={(event) =>
                  setSelectedCommodityId(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                <option value="">
                  Select crop
                </option>

                {commodities.map(
                  (commodity) => (
                    <option
                      key={commodity.id}
                      value={commodity.id}
                    >
                      {commodity.name}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="booking-quantity"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-800"
            >
              <Scale
                size={17}
                className="text-[var(--color-primary)]"
              />
              Estimated quantity
            </label>

            <div className="relative">
              <input
                id="booking-quantity"
                type="number"
                min="0.01"
                max="1000"
                step="0.01"
                inputMode="decimal"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 pr-16 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />

              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-gray-500">
                QTL
              </span>
            </div>

            <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
              Enter your expected quantity. Maximum
              1000 QTL.
            </p>

            {quantity.trim() !== "" &&
              !quantityIsValid && (
                <p className="mt-1 text-xs text-red-600">
                  Quantity must be greater than 0 and
                  not more than 1000 QTL.
                </p>
              )}
          </div>
        </div>

        {/* Booking summary */}
        {bookingReady && (
          <div className="mt-5 rounded-xl bg-[var(--color-primary-light)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Booking details
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary-dark)]">
                  {
                    commodities.find(
                      (commodity) =>
                        commodity.id ===
                        selectedCommodityId
                    )?.name
                  }{" "}
                  · {selectedQuantity} QTL
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                Ready to book
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Date selector */}
      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Select a date
            </p>

            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Choose when you want to visit the
              procurement centre.
            </p>
          </div>

          <span className="text-xs font-medium text-[var(--color-primary)]">
            {availableDates.length} dates available
          </span>
        </div>

        {/* Dates */}
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

      {/* Selected date */}
      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">
              Available times
            </h3>

            <p className="text-sm text-[var(--color-text-secondary)]">
              {selectedDate
                ? `${formatDate(selectedDate).weekday}, ${formatDate(selectedDate).day} ${formatDate(selectedDate).month}`
                : "Select a date"}
            </p>
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

              const isFull = remaining <= 0;

              return (
                <Card
                  key={slot.id}
                  hover={
                    !isFull && bookingReady
                  }
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

                  <div className="mt-5 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {slot.booked_count} /{" "}
                      {slot.capacity} booked
                    </span>

                    <BookSlotButton
                      slotId={slot.id}
                      commodityId={
                        selectedCommodityId
                      }
                      estimatedQuantityQtl={
                        selectedQuantity
                      }
                      disabled={
                        isFull ||
                        !bookingReady ||
                        commodityLoading ||
                        Boolean(commodityError)
                      }
                    />
                  </div>

                  {!bookingReady &&
                    !commodityLoading && (
                      <p className="mt-2 text-right text-xs text-amber-700">
                        Select a crop and enter
                        quantity to book.
                      </p>
                    )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}