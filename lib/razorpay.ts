"use client"

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  image?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
    backdrop_color?: string
  }
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    animation?: boolean
  }
  handler?: (response: RazorpayResponse) => void
}

export interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: (response: unknown) => void) => void
  close: () => void
}

let scriptLoadingPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false)
  }

  if (window.Razorpay) {
    return Promise.resolve(true)
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      if (window.Razorpay) {
        resolve(true)
      } else {
        existing.addEventListener("load", () => resolve(true), { once: true })
        existing.addEventListener("error", () => {
          scriptLoadingPromise = null
          resolve(false)
        }, { once: true })
      }
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptLoadingPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return scriptLoadingPromise
}

export async function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "name" | "description"> & {
    name?: string
    description?: string
  }
): Promise<RazorpayResponse> {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay payment gateway")
  }

  return new Promise((resolve, reject) => {
    let resolved = false

    const rzp = new window.Razorpay!({
      ...options,
      name: options.name || "AWS Re:Invent Fest 2026",
      description: options.description || "Festival Pass Booking",
      theme: {
        color: "#FF00D4",
        backdrop_color: "#050505",
        ...options.theme
      },
      handler: (response: RazorpayResponse) => {
        resolved = true
        resolve(response)
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          if (!resolved) {
            reject(new Error("Payment window was closed by the user"))
          }
          options.modal?.ondismiss?.()
        }
      }
    })

    rzp.on("payment.failed", (response: unknown) => {
      // Don't reject on first failure; user can retry payment within the Razorpay modal.
      // The promise rejects only when modal is closed (ondismiss).
      console.warn("Razorpay payment attempt failed (user can retry in modal):", response)
    })

    rzp.open()
  })
}
