export function generateQrMatrix(text: string): boolean[][] {
  const dataBytes = new TextEncoder().encode(text)
  const length = dataBytes.length

  let version = 1
  const capacityM = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213]
  for (let v = 1; v <= 10; v++) {
    if (length <= capacityM[v]) {
      version = v
      break
    }
  }

  if (length > capacityM[10]) {
    throw new Error("Text too long for QR code version 1-10")
  }

  const size = version * 4 + 17
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  )

  const isReserved: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  )

  function setReserved(r: number, c: number, val: boolean) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val
      isReserved[r][c] = true
    }
  }

  function placeFinder(r: number, c: number) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue
        if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
          const isBlack =
            dr === 0 ||
            dr === 6 ||
            dc === 0 ||
            dc === 6 ||
            (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)
          setReserved(nr, nc, isBlack)
        } else {
          setReserved(nr, nc, false)
        }
      }
    }
  }

  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  for (let i = 8; i < size - 8; i++) {
    setReserved(6, i, i % 2 === 0)
    setReserved(i, 6, i % 2 === 0)
  }

  setReserved(size - 8, 8, true)

  const alignmentPatterns: Record<number, number[]> = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50]
  }

  if (alignmentPatterns[version]) {
    const coords = alignmentPatterns[version]
    for (const r of coords) {
      for (const c of coords) {
        if (
          (r === 6 && c === 6) ||
          (r === 6 && c === size - 7) ||
          (r === size - 7 && c === 6)
        ) {
          continue
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack =
              Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)
            setReserved(r + dr, c + dc, isBlack)
          }
        }
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    setReserved(8, i, false)
    setReserved(i, 8, false)
    setReserved(8, size - 1 - i, false)
    setReserved(size - 1 - i, 8, false)
  }

  const versionInfo: Record<number, number> = {
    7: 0x07c94,
    8: 0x085bc,
    9: 0x09a99,
    10: 0x0a4d3
  }

  if (version >= 7) {
    const vBits = versionInfo[version]
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >> i) & 1) === 1
      const r = Math.floor(i / 3)
      const c = i % 3
      setReserved(r, size - 11 + c, bit)
      setReserved(size - 11 + c, r, bit)
    }
  }

  interface VersionSpec {
    ecPerBlock: number
    g1Blocks: number
    g1DataCodewords: number
    g2Blocks: number
    g2DataCodewords: number
  }

  const VERSION_SPECS: Record<number, VersionSpec> = {
    1: { ecPerBlock: 10, g1Blocks: 1, g1DataCodewords: 16, g2Blocks: 0, g2DataCodewords: 0 },
    2: { ecPerBlock: 16, g1Blocks: 1, g1DataCodewords: 28, g2Blocks: 0, g2DataCodewords: 0 },
    3: { ecPerBlock: 26, g1Blocks: 1, g1DataCodewords: 44, g2Blocks: 0, g2DataCodewords: 0 },
    4: { ecPerBlock: 18, g1Blocks: 2, g1DataCodewords: 32, g2Blocks: 0, g2DataCodewords: 0 },
    5: { ecPerBlock: 24, g1Blocks: 2, g1DataCodewords: 43, g2Blocks: 0, g2DataCodewords: 0 },
    6: { ecPerBlock: 16, g1Blocks: 4, g1DataCodewords: 27, g2Blocks: 0, g2DataCodewords: 0 },
    7: { ecPerBlock: 18, g1Blocks: 4, g1DataCodewords: 31, g2Blocks: 0, g2DataCodewords: 0 },
    8: { ecPerBlock: 22, g1Blocks: 2, g1DataCodewords: 38, g2Blocks: 2, g2DataCodewords: 39 },
    9: { ecPerBlock: 22, g1Blocks: 3, g1DataCodewords: 36, g2Blocks: 2, g2DataCodewords: 37 },
    10: { ecPerBlock: 26, g1Blocks: 4, g1DataCodewords: 43, g2Blocks: 1, g2DataCodewords: 44 },
  }

  const spec = VERSION_SPECS[version]
  const totalDataCodewords = spec.g1Blocks * spec.g1DataCodewords + spec.g2Blocks * spec.g2DataCodewords

  const bits: number[] = []
  function pushBits(val: number, numBits: number) {
    for (let i = numBits - 1; i >= 0; i--) {
      bits.push((val >> i) & 1)
    }
  }

  pushBits(0b0100, 4)
  pushBits(length, version < 10 ? 8 : 16)
  for (let i = 0; i < length; i++) {
    pushBits(dataBytes[i], 8)
  }

  const maxDataBits = totalDataCodewords * 8
  const terminatorLength = Math.min(4, maxDataBits - bits.length)
  pushBits(0, terminatorLength)

  while (bits.length % 8 !== 0) {
    bits.push(0)
  }

  const padBytes = [0xec, 0x11]
  let padIdx = 0
  while (bits.length < maxDataBits) {
    pushBits(padBytes[padIdx % 2], 8)
    padIdx++
  }

  const dataBlocks: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i + b]
    }
    dataBlocks.push(byteVal)
  }

  const expTable = new Uint8Array(512)
  const logTable = new Uint8Array(256)
  let x = 1
  for (let i = 0; i < 255; i++) {
    expTable[i] = x
    expTable[i + 255] = x
    logTable[x] = i
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0)
  }

  function gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0
    return expTable[logTable[a] + logTable[b]]
  }

  function getGeneratorPoly(numEc: number): number[] {
    let poly = [1]
    for (let i = 0; i < numEc; i++) {
      const next = [1, expTable[i]]
      const res: number[] = new Array(poly.length + 1).fill(0)
      for (let j = 0; j < poly.length; j++) {
        for (let k = 0; k < 2; k++) {
          res[j + k] ^= gfMul(poly[j], next[k])
        }
      }
      poly = res
    }
    return poly
  }

  const rawBlocks: number[][] = []
  let offset = 0
  for (let i = 0; i < spec.g1Blocks; i++) {
    rawBlocks.push(dataBlocks.slice(offset, offset + spec.g1DataCodewords))
    offset += spec.g1DataCodewords
  }
  for (let i = 0; i < spec.g2Blocks; i++) {
    rawBlocks.push(dataBlocks.slice(offset, offset + spec.g2DataCodewords))
    offset += spec.g2DataCodewords
  }

  const genPoly = getGeneratorPoly(spec.ecPerBlock)
  const ecBlocks: number[][] = []
  for (const b of rawBlocks) {
    const remainder = new Array(spec.ecPerBlock).fill(0)
    for (let i = 0; i < b.length; i++) {
      const factor = b[i] ^ remainder[0]
      remainder.shift()
      remainder.push(0)
      for (let j = 0; j < spec.ecPerBlock; j++) {
        remainder[j] ^= gfMul(genPoly[j + 1], factor)
      }
    }
    ecBlocks.push(remainder)
  }

  const finalCodewords: number[] = []
  const maxDataLen = Math.max(spec.g1DataCodewords, spec.g2DataCodewords)
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < rawBlocks.length; b++) {
      if (i < rawBlocks[b].length) {
        finalCodewords.push(rawBlocks[b][i])
      }
    }
  }

  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      finalCodewords.push(ecBlocks[b][i])
    }
  }

  const finalBits: number[] = []
  for (const b of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((b >> i) & 1)
    }
  }

  let bitIdx = 0
  let upward = true
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i)

    for (const r of rows) {
      for (const col of [right, right - 1]) {
        if (!isReserved[r][col]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0
          const mask = (r + col) % 2 === 0
          matrix[r][col] = (bit ^ (mask ? 1 : 0)) === 1
        }
      }
    }
    upward = !upward
  }

  const formatBits = [
    1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0
  ]

  const formatCoordsTopLeft = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ]

  const formatCoordsSplit = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8],
    [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ]

  for (let i = 0; i < 15; i++) {
    const bit = formatBits[i] === 1
    const [r1, c1] = formatCoordsTopLeft[i]
    matrix[r1][c1] = bit
    const [r2, c2] = formatCoordsSplit[i]
    matrix[r2][c2] = bit
  }

  return matrix.map((row) => row.map((cell) => cell ?? false))
}

export function generateQrSvgPath(matrix: boolean[][]): string {
  const size = matrix.length
  let path = ""
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c},${r}h1v1h-1z `
      }
    }
  }
  return path.trim()
}
