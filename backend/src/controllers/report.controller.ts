import { Request, Response } from 'express'
import { getAppData } from '../services/appData.service'

export const getReport = async (_req: Request, res: Response) => {
  try {
    const data = await getAppData()
    return res.json(data.dashboard)
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export const getMonthReport = async (_req: Request, res: Response) => {
  try {
    const data = await getAppData()
    return res.json(data.month)
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export const getYearReport = async (_req: Request, res: Response) => {
  try {
    const data = await getAppData()
    return res.json(data.year)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
