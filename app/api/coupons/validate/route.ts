import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code") || ""
    const categoryId = searchParams.get("category_id") || ""
    const amountInPaise = searchParams.get("amount_in_paise") || searchParams.get("amount") || ""

    if (!code.trim()) {
      return NextResponse.json(
        { valid: false, message: "Please enter a coupon code" },
        { status: 400 }
      )
    }

    const q = new URLSearchParams()
    if (categoryId) q.set("category_id", categoryId)
    if (amountInPaise) q.set("amount_in_paise", amountInPaise)

    const queryStr = q.toString() ? `?${q.toString()}` : ""
    const response = await backendFetch(`/api/v1/coupons/validate/${encodeURIComponent(code.trim().toUpperCase())}${queryStr}`)
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { valid: false, message: err instanceof Error ? err.message : "Error validating coupon code" },
      { status: 500 }
    )
  }
}
