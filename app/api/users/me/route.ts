import { NextResponse } from "next/server"
import { authenticatedBackendFetch, backendJson, formatFastApiError } from "@/lib/api/backend"
import { setAuthCookies } from "@/lib/api/auth-cookies"
import type { AuthUser } from "@/types/auth"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    // Normalize phone number to E.164 (+91...) if provided as local digits
    if (typeof body.phone === "string") {
      const trimmed = body.phone.trim()
      const digits = trimmed.replace(/\D/g, "")
      if (digits.length === 10 && !trimmed.startsWith("+")) {
        body.phone = `+91${digits}`
      } else if (digits.length === 11 && digits.startsWith("0")) {
        body.phone = `+91${digits.slice(1)}`
      } else if (digits.length === 12 && digits.startsWith("91") && !trimmed.startsWith("+")) {
        body.phone = `+${digits}`
      } else if (!trimmed.startsWith("+") && digits.length >= 8) {
        body.phone = `+${digits}`
      }
    }

    const { response, refreshedTokens } = await authenticatedBackendFetch(
      request,
      "/api/v1/users/me",
      {
        method: "PATCH",
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      const msg = formatFastApiError(err, "Failed to update profile")
      const res = NextResponse.json(
        { detail: msg },
        { status: response.status }
      )
      if (refreshedTokens) {
        setAuthCookies(res, refreshedTokens)
      }
      return res
    }

    const updatedUser = await backendJson<AuthUser>(response)
    const res = NextResponse.json({ user: updatedUser })
    if (refreshedTokens) {
      setAuthCookies(res, refreshedTokens)
    }
    return res
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
