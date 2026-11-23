import { NextResponse } from "next/server"
import { authenticatedBackendFetch, backendJson, formatFastApiError } from "@/lib/api/backend"
import { setAuthCookies } from "@/lib/api/auth-cookies"
import type { AuthUser } from "@/types/auth"
import type { Order } from "@/types/ticketing"

const ALLOWED_ROLES = ["volunteer", "organizer", "admin"]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Handle /api/orders/analytics
  if (id.toLowerCase() === "analytics") {
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
        `/api/v1/orders/analytics${url.search}`
      )

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        const msg = formatFastApiError(err, "Failed to fetch analytics")
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

  // Handle /api/orders/all
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
        `/api/v1/orders/all${url.search}`
      )

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        const msg = formatFastApiError(err, "Failed to fetch orders")
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

  // Retrieve single order with ownership and role verification
  try {
    const { response: userRes, refreshedTokens: userRefresh } =
      await authenticatedBackendFetch(request, "/api/v1/users/me")

    if (!userRes.ok) {
      return NextResponse.json(
        { detail: "Authentication required" },
        { status: 401 }
      )
    }

    const { response: orderRes, refreshedTokens: orderRefresh } =
      await authenticatedBackendFetch(request, `/api/v1/orders/${id}`)

    const tokensToSet = orderRefresh || userRefresh

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => null)
      const msg = formatFastApiError(err, "Order not found")
      const res = NextResponse.json({ detail: msg }, { status: orderRes.status })
      if (tokensToSet) {
        setAuthCookies(res, tokensToSet)
      }
      return res
    }

    const user: AuthUser = await userRes.json()
    const order: Order = await orderRes.json()

    const isStaff = user.roles?.some((r) =>
      ALLOWED_ROLES.includes(r.toLowerCase())
    )

    if (!isStaff && order.user_id !== user.id) {
      return NextResponse.json(
        { detail: "You do not have permission to access this order" },
        { status: 403 }
      )
    }

    const res = NextResponse.json(order)
    if (tokensToSet) {
      setAuthCookies(res, tokensToSet)
    }
    return res
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
