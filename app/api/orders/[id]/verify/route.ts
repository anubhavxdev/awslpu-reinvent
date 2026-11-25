import { NextResponse } from "next/server"
import { authenticatedBackendFetch, backendJson, formatFastApiError } from "@/lib/api/backend"
import { setAuthCookies } from "@/lib/api/auth-cookies"
import type { Order } from "@/types/ticketing"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { response, refreshedTokens } = await authenticatedBackendFetch(
      request,
      `/api/v1/orders/${id}/verify`,
      {
        method: "POST",
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      const msg = formatFastApiError(err, "Payment verification failed")
      const res = NextResponse.json({ detail: msg }, { status: response.status })
      if (refreshedTokens) {
        setAuthCookies(res, refreshedTokens)
      }
      return res
    }

    const data = await backendJson<Order>(response)
    const res = NextResponse.json(data)
    if (refreshedTokens) {
      setAuthCookies(res, refreshedTokens)
    }
    return res
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal error during payment verification" },
      { status: 500 }
    )
  }
}
