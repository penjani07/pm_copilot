import { NextRequest, NextResponse } from "next/server";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleUserProfile = {
  email?: string;
  name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const googleError = request.nextUrl.searchParams.get("error");
  const savedState = request.cookies.get("google_oauth_state")?.value;
  const returnedState = request.nextUrl.searchParams.get("state");
  const signInUrl = new URL("/signin", request.url);

  if (googleError || !code || !returnedState || returnedState !== savedState) {
    signInUrl.searchParams.set("oauth", "google-error");
    return NextResponse.redirect(signInUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    signInUrl.searchParams.set("oauth", "missing-google-env");
    return NextResponse.redirect(signInUrl);
  }

  let tokenPayload: GoogleTokenResponse;
  let tokenResponse: Response;

  try {
    tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;
  } catch {
    signInUrl.searchParams.set("oauth", "google-error");
    return NextResponse.redirect(signInUrl);
  }

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    signInUrl.searchParams.set("oauth", "google-error");
    return NextResponse.redirect(signInUrl);
  }

  let profileResponse: Response;
  let profile: GoogleUserProfile;

  try {
    profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
        },
      },
    );
    profile = (await profileResponse.json()) as GoogleUserProfile;
  } catch {
    signInUrl.searchParams.set("oauth", "google-error");
    return NextResponse.redirect(signInUrl);
  }

  if (!profileResponse.ok || !profile.email) {
    signInUrl.searchParams.set("oauth", "google-error");
    return NextResponse.redirect(signInUrl);
  }

  const workspaceUrl = new URL("/", request.url);
  workspaceUrl.searchParams.set("auth", "google");
  const response = NextResponse.redirect(workspaceUrl);
  response.cookies.delete("google_oauth_state");
  response.cookies.set(
    "pm_copilot_user",
    JSON.stringify({
      email: profile.email,
      name: profile.name ?? profile.email,
      picture: profile.picture ?? null,
      provider: "google",
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    },
  );

  return response;
}
