import crypto from 'crypto'

type JwtPayload = {
  sub: string
  email: string
  name: string
  exp: number
}

const base64Url = (value: Buffer | string) => {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET no esta definido')
  }

  return secret ?? 'dev-secret-change-me'
}

const signPart = (value: string) => {
  return base64Url(
    crypto
      .createHmac('sha256', getSecret())
      .update(value)
      .digest()
  )
}

export const signToken = (payload: Omit<JwtPayload, 'exp'>) => {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64Url(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  }))
  const signature = signPart(`${header}.${body}`)

  return `${header}.${body}.${signature}`
}

export const verifyToken = (token: string): JwtPayload | null => {
  const [header, body, signature] = token.split('.')

  if (!header || !body || !signature) return null

  const expectedSignature = signPart(`${header}.${body}`)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as JwtPayload

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null

  return payload
}
