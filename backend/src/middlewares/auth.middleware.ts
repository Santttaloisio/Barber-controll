import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : null

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  return next()
}
