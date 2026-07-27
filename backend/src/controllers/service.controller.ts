import { Request, Response } from 'express'
import { supabase } from '../db/supabase'
import { getAppData, invalidateAppDataCache } from '../services/appData.service'

export const getServices = async (_req: Request, res: Response) => {
  try {
    const data = await getAppData()
    return res.json(data.services)
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export const createService = async (req: Request, res: Response) => {
  const { name, nombre, price, precioBase } = req.body

  const { data, error } = await supabase
    .from('services')
    .insert([{
      name: name ?? nombre,
      price: price ?? precioBase
    }])
    .select()

  if (error) return res.status(500).json({ error })

  invalidateAppDataCache()

  return res.json(data?.[0])
}

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, nombre, price, precioBase } = req.body

  const { data, error } = await supabase
    .from('services')
    .update({
      name: name ?? nombre,
      price: price ?? precioBase
    })
    .eq('id', id)
    .select()

  if (error) return res.status(500).json({ error })

  invalidateAppDataCache()

  return res.json(data?.[0])
}
