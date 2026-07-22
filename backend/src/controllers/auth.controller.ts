import { Request, Response } from 'express'
import { signToken } from '../utils/jwt'

const getAuthConfig = () => {
  return {
    email: process.env.AUTH_EMAIL ?? 'admin@barber.local',
    password: process.env.AUTH_PASSWORD ?? 'admin123',
    name: process.env.AUTH_NAME ?? 'Administrador'
  }
}

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body
  const auth = getAuthConfig()

  if (email !== auth.email || password !== auth.password) {
    return res.status(401).json({ message: 'Credenciales invalidas' })
  }

  const user = {
    email: auth.email,
    name: auth.name
  }

  const token = signToken({
    sub: auth.email,
    email: auth.email,
    name: auth.name
  })

  return res.json({ token, user })
}
