"use client"

import { useMemo } from "react"
import { generateQrMatrix, generateQrSvgPath } from "@/lib/qr"

interface QrCodeProps {
  value: string
  size?: number
  className?: string
  fgColor?: string
  bgColor?: string
}

export function QrCode({
  value,
  size = 220,
  className = "",
  fgColor = "#000000",
  bgColor = "#ffffff"
}: QrCodeProps) {
  const { path, matrixSize } = useMemo(() => {
    try {
      const matrix = generateQrMatrix(value)
      return {
        path: generateQrSvgPath(matrix),
        matrixSize: matrix.length
      }
    } catch {
      return { path: "", matrixSize: 21 }
    }
  }, [value])

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-[0_0_30px_rgba(255,255,255,0.15)] ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`-4 -4 ${matrixSize + 8} ${matrixSize + 8}`}
        className="w-full h-full"
        style={{ shapeRendering: "crispEdges" }}
      >
        <rect
          x={-4}
          y={-4}
          width={matrixSize + 8}
          height={matrixSize + 8}
          fill={bgColor}
        />
        <path d={path} fill={fgColor} />
      </svg>
    </div>
  )
}
