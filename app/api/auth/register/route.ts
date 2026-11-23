import { NextResponse } from "next/server"
import { backendFetch, formatFastApiError } from "@/lib/api/backend"
import { setAuthCookies } from "@/lib/api/auth-cookies"
import type { RegisterRequest, TokenResponse } from "@/types/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json() as RegisterRequest

    const response = await backendFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const message = formatFastApiError(errorData, "Registration failed")
      return NextResponse.json({ detail: message }, { status: response.status })
    }

    const tokens = await response.json() as TokenResponse

    const result = NextResponse.json({
      success: true
    })

    setAuthCookies(result, tokens)

    return result
  } catch (error) {
    return NextResponse.json(
      {
        detail: error instanceof Error ? error.message : "Registration failed"
      },
      { status: 500 }
    )
  }
}