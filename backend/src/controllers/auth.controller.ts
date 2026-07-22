import { Request, Response } from 'express'
import { signToken } from '../utils/jwt'

const getAuthConfig = () => {
  return {
    username: process.env.AUTH_USERNAME ?? process.env.AUTH_EMAIL ?? 'Adminwest',
    password: process.env.AUTH_PASSWORD ?? 'admin123',
    name: process.env.AUTH_NAME ?? 'Administrador'
  }
}

export const login = (req: Request, res: Response) => {
  const { username, email, password } = req.body
  const auth = getAuthConfig()
  const loginName = username ?? email

  if (loginName !== auth.username || password !== auth.password) {
    return res.status(401).json({ message: 'Credenciales invalidas' })
  }

  const user = {
    username: auth.username,
    name: auth.name
  }

  const token = signToken({
    sub: auth.username,
    username: auth.username,
    name: auth.name
  })

  return res.json({ token, user })
}
