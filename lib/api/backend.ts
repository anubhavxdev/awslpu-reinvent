import "server-only"
import { headers as getNextHeaders } from "next/headers"
import { getAuthCookies } from "./auth-cookies"
import type { TokenResponse } from "@/types/auth"

function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BACKEND_API_URL is not configured")
    }
    return "http://localhost:8000"
  }
  return url
}

export function getBackendApiKey(): string {
  return process.env.BACKEND_API_KEY || process.env.X_API_KEY || ""
}

export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const backendApiUrl = getBackendApiUrl()
  const apiKey = getBackendApiKey()
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (apiKey && !headers.has("X-API-KEY")) {
    headers.set("X-API-KEY", apiKey)
  }

  try {
    const nextHeaders = await getNextHeaders()
    const forwardedFor = nextHeaders.get("x-forwarded-for")
    const realIp = nextHeaders.get("x-real-ip")
    if (forwardedFor && !headers.has("X-Forwarded-For")) {
      headers.set("X-Forwarded-For", forwardedFor)
    }
    if (realIp && !headers.has("X-Real-IP")) {
      headers.set("X-Real-IP", realIp)
    }
  } catch {
    // Outside request context
  }

  const { cache, ...restOptions } = options

  return fetch(`${backendApiUrl.replace(/\/$/, "")}${path}`, {
    ...restOptions,
    headers,
    cache: cache ?? "no-store"
  })
}

export async function authenticatedBackendFetch(
  request: Request,
  path: string,
  options: RequestInit = {}
): Promise<{ response: Response; refreshedTokens: TokenResponse | null }> {
  const { accessToken, refreshToken } = getAuthCookies(request)
  let currentToken = accessToken
  let refreshedTokens: TokenResponse | null = null

  if (!currentToken && refreshToken) {
    try {
      const refreshRes = await backendFetch("/api/v1/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      if (refreshRes.ok) {
        refreshedTokens = await refreshRes.json()
        currentToken = refreshedTokens?.access_token || null
      }
    } catch {
      // Refresh failed
    }
  }

  const headers = new Headers(options.headers)
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`)
  }

  let response = await backendFetch(path, {
    ...options,
    headers
  })

  if (response.status === 401 && refreshToken && !refreshedTokens) {
    try {
      const refreshRes = await backendFetch("/api/v1/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      if (refreshRes.ok) {
        refreshedTokens = await refreshRes.json()
        if (refreshedTokens?.access_token) {
          headers.set("Authorization", `Bearer ${refreshedTokens.access_token}`)
          response = await backendFetch(path, {
            ...options,
            headers
          })
        }
      }
    } catch {
      // Refresh failed
    }
  }

  return { response, refreshedTokens }
}

export function formatFastApiError(data: unknown, fallback: string): string {
  if (!data) return fallback
  if (typeof data === "string") return data
  if (typeof data !== "object") return fallback

  const obj = data as Record<string, unknown>
  if (typeof obj.detail === "string") return obj.detail
  if (Array.isArray(obj.detail)) {
    return obj.detail
      .map((err: unknown) => {
        if (typeof err === "string") return err
        if (typeof err === "object" && err !== null) {
          const e = err as Record<string, unknown>
          const loc = Array.isArray(e.loc)
            ? e.loc.filter((l) => l !== "body").join(".")
            : ""
          const msg =
            typeof e.msg === "string"
              ? e.msg
              : typeof e.message === "string"
              ? e.message
              : JSON.stringify(e)
          return loc ? `${loc}: ${msg}` : msg
        }
        return JSON.stringify(err)
      })
      .filter(Boolean)
      .join(", ")
  }
  if (typeof obj.detail === "object" && obj.detail !== null) {
    const d = obj.detail as Record<string, unknown>
    return (
      typeof d.msg === "string"
        ? d.msg
        : typeof d.message === "string"
        ? d.message
        : JSON.stringify(d)
    )
  }
  if (typeof obj.message === "string") return obj.message
  return fallback
}

export async function backendJson<T>(
  response: Response
): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = formatFastApiError(
      data,
      `Backend request failed (${response.status})`
    )

    throw new Error(message)
  }

  return data as T
}
