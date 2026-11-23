import { NextResponse } from "next/server"
import { authenticatedBackendFetch, backendJson, formatFastApiError } from "@/lib/api/backend"
import { setAuthCookies } from "@/lib/api/auth-cookies"
import type { AuthUser } from "@/types/auth"
import type { Ticket } from "@/types/ticketing"

const ALLOWED_ROLES = ["volunteer", "organizer", "admin"]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // If id is "all", restrict to volunteer, organizer, admin
  if (id.toLowerCase() === "all") {
    try {
      const { response: userRes, refreshedTokens: userRefresh } =
        await authenticatedBackendFetch(request, "/api/v1/users/me")

      if (!userRes.ok) {
        return NextResponse.json(
          { detail: "Authentication required" },
          { status: 401 }
        )
      }

      const user: AuthUser = await userRes.json()
      const hasRole = user.roles?.some((r) =>
        ALLOWED_ROLES.includes(r.toLowerCase())
      )

      if (!hasRole) {
        return NextResponse.json(
          { detail: "Only volunteer, organizer, admin can access this endpoint" },
          { status: 403 }
        )
      }

      const url = new URL(request.url)
      const { response, refreshedTokens } = await authenticatedBackendFetch(
        request,
        `/api/v1/tickets/all${url.search}`
      )

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        const msg = formatFastApiError(err, "Failed to fetch tickets")
        const res = NextResponse.json({ detail: msg }, { status: response.status })
        if (refreshedTokens || userRefresh) {
          setAuthCookies(res, (refreshedTokens || userRefresh)!)
        }
        return res
      }

      const data = await backendJson(response)
      const res = NextResponse.json(data)
      if (refreshedTokens || userRefresh) {
        setAuthCookies(res, (refreshedTokens || userRefresh)!)
      }
      return res
    } catch (error) {
      return NextResponse.json(
        { detail: error instanceof Error ? error.message : "Internal error" },
        { status: 500 }
      )
    }
  }

  try {
    const { response, refreshedTokens } = await authenticatedBackendFetch(
      request,
      `/api/v1/tickets/${id}`
    )

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      const msg = formatFastApiError(err, "Ticket not found")
      const res = NextResponse.json({ detail: msg }, { status: response.status })
      if (refreshedTokens) {
        setAuthCookies(res, refreshedTokens)
      }
      return res
    }

    const data = await backendJson<Ticket>(response)
    const res = NextResponse.json(data)
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
