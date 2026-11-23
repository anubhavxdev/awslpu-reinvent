import { NextResponse } from "next/server"
import { backendFetch, formatFastApiError } from "@/lib/api/backend"
import { setAuthCookies } from "@/lib/api/auth-cookies"
import type { LoginRequest, TokenResponse } from "@/types/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json() as LoginRequest

    const response = await backendFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const message = formatFastApiError(errorData, "Login failed")
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
        detail: error instanceof Error ? error.message : "Login failed"
      },
      { status: 500 }
    )
  }
}