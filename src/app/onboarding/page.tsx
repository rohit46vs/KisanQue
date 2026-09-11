"use client";

import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const STATES = [
  {
    group: "States",
    options: [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
    ],
  },
  {
    group: "Union Territories",
    options: [
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi",
      "Jammu and Kashmir",
      "Ladakh",
      "Lakshadweep",
      "Puducherry",
    ],
  },
];

const LANGUAGES = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "hi",
    label: "हिन्दी",
  },
  {
    value: "pa",
    label: "ਪੰਜਾਬੀ",
  },
  {
    value: "mr",
    label: "मराठी",
  },
  {
    value: "bn",
    label: "বাংলা",
  },
  {
    value: "te",
    label: "తెలుగు",
  },
  {
    value: "ta",
    label: "தமிழ்",
  },
];

type ProfileData = {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  language: string | null;
  onboarding_completed: boolean | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [userEmail, setUserEmail] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [village, setVillage] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [state, setState] =
    useState("");

  const [pincode, setPincode] =
    useState("");

  const [language, setLanguage] =
    useState("en");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setUserEmail(
            user.email ?? ""
          );

          const metadataName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "";

          setFullName(metadataName);
        }

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(
              `
              full_name,
              phone,
              address_line1,
              village,
              district,
              state,
              pincode,
              language,
              onboarding_completed
              `
            )
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          console.error(
            "Unable to load onboarding profile:",
            profileError
          );

          throw new Error(
            "Unable to load your profile."
          );
        }

        if (
          profile?.onboarding_completed ===
          true
        ) {
          router.replace("/");
          return;
        }

        if (!cancelled && profile) {
          applyProfile(profile);
        }
      } catch (loadError) {
        console.error(
          "Onboarding load error:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Unable to load your profile. Please refresh and try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  function applyProfile(
    profile: ProfileData
  ) {
    if (profile.full_name) {
      setFullName(
        profile.full_name
      );
    }

    if (profile.phone) {
      setPhone(profile.phone);
    }

    if (profile.address_line1) {
      setAddress(
        profile.address_line1
      );
    }

    if (profile.village) {
      setVillage(profile.village);
    }

    if (profile.district) {
      setDistrict(profile.district);
    }

    if (profile.state) {
      setState(profile.state);
    }

    if (profile.pincode) {
      setPincode(profile.pincode);
    }

    if (profile.language) {
      setLanguage(
        profile.language
      );
    }
  }

  function normalizePhone(
    value: string
  ) {
    const cleaned =
      value.replace(/\D/g, "");

    if (
      cleaned.startsWith("91") &&
      cleaned.length === 12
    ) {
      return `+${cleaned}`;
    }

    if (
      cleaned.length === 10
    ) {
      return `+91${cleaned}`;
    }

    return value.trim();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError(null);

    const trimmedName =
      fullName.trim();

    const trimmedPhone =
      normalizePhone(phone);

    const trimmedAddress =
      address.trim();

    const trimmedVillage =
      village.trim();

    const trimmedDistrict =
      district.trim();

    const trimmedPincode =
      pincode.trim();

    if (
      trimmedName.length < 2
    ) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (
      !/^\+91[6-9]\d{9}$/.test(
        trimmedPhone
      )
    ) {
      setError(
        "Please enter a valid Indian mobile number."
      );
      return;
    }

    if (
      trimmedAddress.length < 3
    ) {
      setError(
        "Please enter your address."
      );
      return;
    }

    if (
      trimmedVillage.length < 2
    ) {
      setError(
        "Please enter your village or locality."
      );
      return;
    }

    if (
      trimmedDistrict.length < 2
    ) {
      setError(
        "Please enter your district."
      );
      return;
    }

    if (!state) {
      setError(
        "Please select your State / Union Territory."
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        trimmedPincode
      )
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (!language) {
      setError(
        "Please select your preferred language."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      /*
       * Mobile number is collected now.
       *
       * SMS verification is intentionally not required
       * because we are not using a paid SMS provider yet.
       */
      const {
        error: updateError,
      } =
        await supabase
          .from("profiles")
          .update({
            full_name:
              trimmedName,
            phone:
              trimmedPhone,
            address_line1:
              trimmedAddress,
            village:
              trimmedVillage,
            district:
              trimmedDistrict,
            state,
            pincode:
              trimmedPincode,
            language,
            onboarding_completed:
              true,
          })
          .eq(
            "id",
            user.id
          );

      if (updateError) {
        console.error(
          "Onboarding save error:",
          updateError
        );

        throw new Error(
          updateError.message
        );
      }

      router.refresh();
      router.replace("/");
    } catch (saveError) {
      console.error(
        "Onboarding save error:",
        saveError
      );

      setError(
        "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3faf5] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16803c] text-white shadow-lg">
            <UserRound size={23} />
          </div>

          <p className="mt-4 text-sm font-semibold text-[#17351f]">
            Loading your profile...
          </p>

          <p className="mt-1 text-xs text-[#718078]">
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3faf5] px-4 py-8 text-[#17351f] sm:px-6 lg:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16803c] text-white shadow-[0_10px_30px_rgba(22,128,60,0.2)]">
            <UserRound size={23} />
          </div>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#16803c]">
            KisanQueue
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#123d25] sm:text-3xl">
            Complete your farmer profile
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718078]">
            Tell us a few details so we can provide
            the correct procurement centres and
            services for you.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[24px] border border-[#d8eadc] bg-white shadow-[0_15px_50px_rgba(22,74,40,0.08)]"
        >
          {/* Account */}
          <div className="border-b border-[#e4eee7] bg-[#f5fbf7] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16803c]">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#17351f]">
                  Account connected
                </p>

                <p className="mt-0.5 text-xs text-[#718078]">
                  {userEmail || "Google account"}
                </p>
              </div>

              <CheckCircle2
                size={18}
                className="ml-auto text-[#16803c]"
              />
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            {/* Personal details */}
            <section>
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16803c]">
                  Personal details
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#123d25]">
                  Basic information
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  required
                >
                  <input
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="input"
                    maxLength={100}
                    required
                  />
                </Field>

                <Field
                  label="Mobile Number"
                  required
                >
                  <div className="relative">
                    <Phone
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087]"
                    />

                    <input
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      placeholder="9876543210"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={15}
                      className="input pl-10"
                      required
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Address */}
            <section>
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                  Location
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#123d25]">
                  Where do you live?
                </h2>
              </div>

              <div className="space-y-4">
                <Field
                  label="Address"
                  required
                >
                  <textarea
                    value={address}
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    placeholder="House number, street, village road, etc."
                    className="input min-h-[92px] resize-y"
                    maxLength={300}
                    required
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Village / Locality"
                    required
                  >
                    <input
                      value={village}
                      onChange={(event) =>
                        setVillage(
                          event.target.value
                        )
                      }
                      placeholder="Village or locality"
                      className="input"
                      maxLength={100}
                      required
                    />
                  </Field>

                  <Field
                    label="District"
                    required
                  >
                    <input
                      value={district}
                      onChange={(event) =>
                        setDistrict(
                          event.target.value
                        )
                      }
                      placeholder="District"
                      className="input"
                      maxLength={100}
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="State / Union Territory"
                    required
                  >
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#829087]"
                      />

                      <select
                        value={state}
                        onChange={(event) =>
                          setState(
                            event.target.value
                          )
                        }
                        className="input appearance-none pl-10"
                        required
                      >
                        <option value="">
                          Select State / UT
                        </option>

                        {STATES.map(
                          (group) => (
                            <optgroup
                              key={group.group}
                              label={
                                group.group
                              }
                            >
                              {group.options.map(
                                (option) => (
                                  <option
                                    key={
                                      option
                                    }
                                    value={
                                      option
                                    }
                                  >
                                    {option}
                                  </option>
                                )
                              )}
                            </optgroup>
                          )
                        )}
                      </select>
                    </div>
                  </Field>

                  <Field
                    label="Pincode"
                    required
                  >
                    <input
                      value={pincode}
                      onChange={(event) =>
                        setPincode(
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              6
                            )
                        )
                      }
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      maxLength={6}
                      className="input"
                      required
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Language */}
            <section>
              <div className="rounded-2xl border border-[#dce9df] bg-[#f8fcf9] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c3aed]">
                    <span className="text-sm font-bold">
                      अ
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#17351f]">
                      Language preference
                    </p>

                    <p className="mt-0.5 text-xs text-[#718078]">
                      You can change this later.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Field label="Preferred language">
                    <select
                      value={language}
                      onChange={(event) =>
                        setLanguage(
                          event.target.value
                        )
                      }
                      className="input"
                    >
                      {LANGUAGES.map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16803c] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(22,128,60,0.18)] transition hover:bg-[#116b32] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving your profile..."
                : "Continue to KisanQueue"}

              {!saving && (
                <ArrowRight size={17} />
              )}
            </button>

            <p className="text-center text-[11px] leading-5 text-[#829087]">
              Your profile information is stored
              securely and used to provide your
              procurement services.
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d8e5dc;
          border-radius: 12px;
          background: #ffffff;
          padding: 11px 13px;
          font-size: 14px;
          color: #17351f;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease;
        }

        .input::placeholder {
          color: #a0aaa4;
        }

        .input:focus {
          border-color: #16803c;
          box-shadow: 0 0 0 3px
            rgba(22, 128, 60, 0.1);
        }

        textarea.input {
          line-height: 1.5;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#355043]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}