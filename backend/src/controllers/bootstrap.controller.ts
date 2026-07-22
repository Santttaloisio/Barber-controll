import { Request, Response } from 'express'
import { getAppData } from '../services/appData.service'

export const getBootstrap = async (_req: Request, res: Response) => {
  try {
    const data = await getAppData()
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
