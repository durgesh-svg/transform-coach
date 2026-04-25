import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const size = Math.min(parseInt(req.nextUrl.searchParams.get('size') ?? '192'), 512)
  const r = Math.round(size * 0.22)
  const font = Math.round(size * 0.48)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
          borderRadius: r,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: font,
        }}
      >
        💪
      </div>
    ),
    { width: size, height: size }
  )
}
