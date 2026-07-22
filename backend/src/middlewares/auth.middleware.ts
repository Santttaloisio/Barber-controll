import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {

  if (req.method === 'OPTIONS') {
    return next()
  }


  const header = req.headers.authorization

  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ message: 'No autorizado (sin token)' })
  }

  const valid = verifyToken(token)

  if (!valid) {
    return res.status(401).json({ message: 'No autorizado (token inválido)' })
  }

  // =========================
  // OK
  // =========================
  return next()
}