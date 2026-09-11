import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request
) {
  const { searchParams, origin } =
    new URL(request.url);

  const code =
    searchParams.get("code");

  let next =
    searchParams.get("next") ?? "/account";

  /*
   * Only allow internal relative paths.
   * This prevents the OAuth callback from
   * becoming an open redirect.
   */
  if (
    !next.startsWith("/") ||
    next.startsWith("//")
  ) {
    next = "/account";
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_code`
    );
  }

  const supabase =
    await createClient();

  const {
    error: exchangeError,
  } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (exchangeError) {
    console.error(
      "OAuth code exchange error:",
      exchangeError
    );

    return NextResponse.redirect(
      `${origin}/login?error=auth_callback`
    );
  }

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Unable to load authenticated user:",
      userError
    );

    return NextResponse.redirect(
      `${origin}/login?error=user_session`
    );
  }

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(
        `
        id,
        role,
        onboarding_completed
        `
      )
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Unable to load farmer profile:",
      profileError
    );

    return NextResponse.redirect(
      `${origin}/login?error=profile`
    );
  }

  /*
   * The profile should normally be created by
   * the database trigger when the Auth user is
   * created.
   *
   * If it doesn't exist for some reason, send
   * the user through onboarding so the app can
   * collect the required farmer information.
   */
  if (
    !profile ||
    profile.onboarding_completed !== true
  ) {
    return NextResponse.redirect(
      `${origin}/onboarding`
    );
  }

  return NextResponse.redirect(
    `${origin}${next}`
  );
}