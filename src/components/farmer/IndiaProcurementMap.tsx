"use client";

import { useState } from "react";
import indiaMap from "@svg-maps/india";

type StateCode =
  | "PB"
  | "HR"
  | "UP"
  | "MP"
  | "RJ"
  | "KA"
  | "OD"
  | "TG"
  | "GJ";

export type ProcurementState = {
  code: StateCode;
  name: string;
  farmers: number;
  quantityQtl: number;
  quantityMt: number;
  centres: number;
  color: string;
  softColor: string;
  status: "active" | "limited" | "inactive";
};

type IndiaLocation = {
  id: string;
  name?: string;
  path: string;
};

const locationToCode: Record<string, StateCode> = {
  punjab: "PB",
  pb: "PB",

  haryana: "HR",
  hr: "HR",

  "uttar-pradesh": "UP",
  uttarpradesh: "UP",
  "uttar_pradesh": "UP",
  up: "UP",

  "madhya-pradesh": "MP",
  madhyapradesh: "MP",
  "madhya_pradesh": "MP",
  mp: "MP",

  rajasthan: "RJ",
  rj: "RJ",

  karnataka: "KA",
  ka: "KA",

  odisha: "OD",
  orissa: "OD",
  od: "OD",

  telangana: "TG",
  tg: "TG",

  gujarat: "GJ",
  gj: "GJ",
};

const dotPositions: Record<
  StateCode,
  {
    left: string;
    top: string;
  }
> = {
  PB: {
    left: "31%",
    top: "23%",
  },

  HR: {
    left: "35%",
    top: "29%",
  },

  UP: {
    left: "49%",
    top: "38%",
  },

  RJ: {
    left: "27%",
    top: "39%",
  },

  MP: {
    left: "43%",
    top: "51%",
  },

  GJ: {
    left: "24%",
    top: "55%",
  },

  KA: {
    left: "38%",
    top: "76%",
  },

  TG: {
    left: "51%",
    top: "67%",
  },

  OD: {
    left: "65%",
    top: "59%",
  },
};

const fallbackColors: Record<
  StateCode,
  {
    color: string;
    softColor: string;
  }
> = {
  PB: {
    color: "#16803c",
    softColor: "#dcfce7",
  },

  HR: {
    color: "#2563eb",
    softColor: "#dbeafe",
  },

  UP: {
    color: "#d97706",
    softColor: "#fef3c7",
  },

  MP: {
    color: "#7c3aed",
    softColor: "#ede9fe",
  },

  RJ: {
    color: "#ca8a04",
    softColor: "#fef9c3",
  },

  KA: {
    color: "#059669",
    softColor: "#d1fae5",
  },

  OD: {
    color: "#0891b2",
    softColor: "#cffafe",
  },

  TG: {
    color: "#16a34a",
    softColor: "#dcfce7",
  },

  GJ: {
    color: "#eab308",
    softColor: "#fef9c3",
  },
};

const stateNames: Record<StateCode, string> = {
  PB: "Punjab",
  HR: "Haryana",
  UP: "Uttar Pradesh",
  MP: "Madhya Pradesh",
  RJ: "Rajasthan",
  KA: "Karnataka",
  OD: "Odisha",
  TG: "Telangana",
  GJ: "Gujarat",
};

const allStateCodes = Object.keys(
  stateNames
) as StateCode[];

type Props = {
  states: ProcurementState[];
};

export default function IndiaProcurementMap({
  states,
}: Props) {
  const [selectedState, setSelectedState] =
    useState<StateCode>("PB");

  const stateLookup = new Map(
    states.map((state) => [
      state.code,
      state,
    ])
  );

  const getState = (
    code: StateCode
  ): ProcurementState => {
    const existing = stateLookup.get(code);

    if (existing) {
      return existing;
    }

    return {
      code,
      name: stateNames[code],
      farmers: 0,
      quantityQtl: 0,
      quantityMt: 0,
      centres: 0,
      color: "#d9e6dc",
      softColor: "#eef4ef",
      status: "inactive",
    };
  };

  const selected = getState(selectedState);

  const getStateCode = (
    location: IndiaLocation
  ): StateCode | null => {
    const normalizedId = location.id
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    return (
      locationToCode[normalizedId] ??
      locationToCode[
        location.id.toLowerCase()
      ] ??
      null
    );
  };

 const reportingStates = states
  .filter(
    (state) =>
      state.centres > 0 ||
      state.farmers > 0 ||
      state.quantityQtl > 0
  )
  .map((state) => state.code)
  .filter((code) => dotPositions[code] !== undefined);

  return (
    <div className="w-full">
      <div className="rounded-[22px] border border-[#dfece3] bg-[#f7fbf8] p-5 sm:p-6">

        {/* Header */}

        <div className="mb-5 flex items-start justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcfce7]">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#16803c]" />
              </span>

              <div>

                <h3 className="text-sm font-semibold text-[#123d25] sm:text-base">
                  Live reporting states
                </h3>

                <p className="mt-0.5 text-[10px] text-[#718078] sm:text-[11px]">
                  Procurement activity reported across India
                </p>

              </div>

            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#d8e9dc] bg-white px-3 py-1.5 text-[9px] font-semibold text-[#16803c] shadow-sm sm:text-[10px]">

            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16803c] opacity-50" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16803c]" />
            </span>

            Live

          </div>

        </div>


        {/* Map */}

        <div className="relative overflow-hidden rounded-[18px] border border-[#e0eee4] bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f1faf3_55%,#e7f5eb_100%)]">

          <div className="pointer-events-none absolute left-[10%] top-[18%] h-32 w-32 rounded-full bg-[#7fdc9b]/20 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-40 w-40 rounded-full bg-[#a7e6b9]/20 blur-3xl" />


          <div className="relative mx-auto w-full max-w-[620px] px-3 py-5 sm:px-8 sm:py-7">

            <div className="relative mx-auto w-full">

              <svg
                viewBox={indiaMap.viewBox}
                role="img"
                aria-label="India procurement activity map"
                className="relative z-10 block h-auto w-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
              >

                {indiaMap.locations.map(
                  (location: IndiaLocation) => {

                    const code =
                      getStateCode(location);

                    const isSelected =
                      code === selectedState;

                    const data = code
                      ? getState(code)
                      : null;

                    let fill = "#dce8df";

                    if (data?.status === "inactive") {
                      fill = "#dce8df";
                    } else if (data) {
                      fill = data.color;
                    }

                    if (isSelected) {
                      fill = "#16803c";
                    }

                    return (
                      <path
                        key={location.id}
                        d={location.path}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth="1.15"
                        vectorEffect="non-scaling-stroke"
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          opacity:
                            data?.status ===
                            "inactive"
                              ? 0.82
                              : 0.95,

                          filter: isSelected
                            ? "drop-shadow(0 4px 8px rgba(22,128,60,0.30))"
                            : undefined,
                        }}
                        onClick={() => {
                          if (code) {
                            setSelectedState(
                              code
                            );
                          }
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.opacity =
                            "1";

                          if (!isSelected) {
                            event.currentTarget.style.filter =
                              "drop-shadow(0 3px 5px rgba(22,128,60,0.12))";
                          }
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.opacity =
                            data?.status ===
                            "inactive"
                              ? "0.82"
                              : "0.95";

                          if (!isSelected) {
                            event.currentTarget.style.filter =
                              "";
                          }
                        }}
                      />
                    );
                  }
                )}

              </svg>


              {/* Live dots */}

              {reportingStates.map(
                (code) => {

                  const position =
                    dotPositions[code];

                  const item =
                    getState(code);

                  return (
                    <button
                      key={code}
                      type="button"
                      aria-label={`Select ${item.name}`}
                      onClick={() =>
                        setSelectedState(code)
                      }
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: position.left,
                        top: position.top,
                      }}
                    >

                      <span
                        className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-20"
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                      <span
                        className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[3px]"
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                      <span
                        className="relative block h-3 w-3 rounded-full border-2 border-white shadow-[0_2px_7px_rgba(0,0,0,0.20)]"
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />

                    </button>
                  );
                }
              )}


              {/* Labels */}

              <div className="pointer-events-none absolute left-[3%] top-[5%] hidden text-[8px] text-[#87958c] sm:block">
                Jammu & Kashmir
              </div>

              <div className="pointer-events-none absolute right-[3%] top-[19%] hidden text-[8px] text-[#87958c] sm:block">
                Arunachal Pradesh
              </div>

              <div className="pointer-events-none absolute right-[3%] top-[31%] hidden text-[8px] text-[#87958c] sm:block">
                Nagaland
              </div>

              <div className="pointer-events-none absolute left-[5%] top-[49%] hidden text-[8px] text-[#87958c] sm:block">
                Gujarat
              </div>

              <div className="pointer-events-none absolute left-[10%] top-[72%] hidden text-[8px] text-[#87958c] sm:block">
                Goa
              </div>

              <div className="pointer-events-none absolute left-[34%] bottom-[3%] hidden text-[8px] text-[#87958c] sm:block">
                Kerala
              </div>

              <div className="pointer-events-none absolute right-[20%] bottom-[3%] hidden text-[8px] text-[#87958c] sm:block">
                Tamil Nadu
              </div>

            </div>


            {/* Selected state card */}

            <div className="absolute bottom-6 right-6 z-30 hidden w-[190px] rounded-[15px] border border-[#dbe9df] bg-white/95 p-3.5 shadow-[0_12px_35px_rgba(21,73,40,0.12)] backdrop-blur-md lg:block">

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#829087]">
                    Selected state
                  </p>

                  <h4 className="mt-1 text-sm font-bold text-[#123d25]">
                    {selected.name}
                  </h4>

                </div>

                <span
                  className="rounded-md px-2 py-1 text-[9px] font-bold"
                  style={{
                    color: selected.color,
                    backgroundColor:
                      selected.softColor,
                  }}
                >
                  {selected.code}
                </span>

              </div>


              <div
                className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-semibold"
                style={{
                  color:
                    selected.status ===
                    "inactive"
                      ? "#718078"
                      : "#16803c",
                  backgroundColor:
                    selected.status ===
                    "inactive"
                      ? "#f1f4f2"
                      : "#ecfdf3",
                }}
              >

                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      selected.status ===
                      "inactive"
                        ? "#9aa59f"
                        : "#16803c",
                  }}
                />

                {selected.status ===
                "active"
                  ? "Active"
                  : selected.status ===
                      "limited"
                    ? "Limited"
                    : "No reporting"}

              </div>


              <div className="mt-3 space-y-2">

                <Metric
                  label="Farmers"
                  value={formatNumber(
                    selected.farmers
                  )}
                />

                <Metric
                  label="Quantity procured"
                  value={`${formatNumber(
                    selected.quantityMt
                  )} MT`}
                />

                <Metric
                  label="Procurement centres"
                  value={formatNumber(
                    selected.centres
                  )}
                />

              </div>

            </div>

          </div>
        </div>


        {/* Legend */}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] text-[#64736a] sm:text-[10px]">

          <LegendDot
            color="#16803c"
            label="Selected"
          />

          <LegendDot
            color="#2563eb"
            label="Active"
          />

          <LegendDot
            color="#eab308"
            label="Limited"
          />

          <LegendDot
            color="#dce8df"
            label="No reporting"
          />

          <div className="flex items-center gap-1.5">

            <span className="relative flex h-2 w-2">

              <span className="absolute h-2 w-2 animate-ping rounded-full bg-[#16a34a] opacity-40" />

              <span className="relative h-2 w-2 rounded-full bg-[#16a34a]" />

            </span>

            <span>Live activity</span>

          </div>

        </div>


        {/* State buttons */}

        <div className="mt-4 flex flex-wrap gap-2">

          {allStateCodes.map(
            (code) => {

              const item =
                getState(code);

              const active =
                selectedState === code;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    setSelectedState(
                      code
                    )
                  }
                  className="rounded-full border px-3 py-1.5 text-[10px] font-medium transition-all duration-200"
                  style={{
                    borderColor: active
                      ? item.color
                      : "#d8e5dc",

                    backgroundColor:
                      active
                        ? item.color
                        : "#ffffff",

                    color: active
                      ? "#ffffff"
                      : "#53635a",

                    boxShadow: active
                      ? `0 4px 12px ${item.color}25`
                      : undefined,
                  }}
                >
                  {item.name}
                </button>
              );
            }
          )}

        </div>


        {/* Mobile selected state */}

        <div className="mt-4 rounded-[15px] border border-[#dbe9df] bg-white p-3.5 lg:hidden">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#829087]">
                Selected state
              </p>

              <p className="mt-1 text-sm font-bold text-[#123d25]">
                {selected.name}
              </p>

            </div>

            <span
              className="rounded-md px-2 py-1 text-[9px] font-bold"
              style={{
                color: selected.color,
                backgroundColor:
                  selected.softColor,
              }}
            >
              {selected.code}
            </span>

          </div>


          <div className="mt-3 grid grid-cols-3 gap-2">

            <Metric
              label="Farmers"
              value={formatNumber(
                selected.farmers
              )}
            />

            <Metric
              label="Quantity"
              value={`${formatNumber(
                selected.quantityMt
              )} MT`}
            />

            <Metric
              label="Centres"
              value={formatNumber(
                selected.centres
              )}
            />

          </div>

        </div>

      </div>
    </div>
  );
}


function formatNumber(
  value: number
): string {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-[#f5f9f6] px-2.5 py-2">

      <p className="text-[7px] text-[#87938b]">
        {label}
      </p>

      <p className="mt-0.5 text-[11px] font-bold text-[#173d27]">
        {value}
      </p>

    </div>
  );
}


function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">

      <span
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      <span>{label}</span>

    </div>
  );
}