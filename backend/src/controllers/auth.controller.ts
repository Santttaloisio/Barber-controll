import { Request, Response } from 'express'
import { signToken } from '../utils/jwt'

const getAuthConfig = () => ({
  username: process.env.AUTH_USERNAME ?? 'Adminwest',
  password: process.env.AUTH_PASSWORD ?? 'admin123',
  name: process.env.AUTH_NAME ?? 'Administrador'
})

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan datos' })
  }

  const auth = getAuthConfig()

  const isValid =
    username.trim() === auth.username &&
    password === auth.password

  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
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