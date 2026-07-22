import { Request, Response } from 'express'
import { supabase } from '../db/supabase'
import { invalidateAppDataCache } from '../services/appData.service'
import { isMissingColumnError, missingMigrationResponse } from '../utils/schemaError'

export const getBarbers = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')

  if (error) return res.status(500).json({ error })

  return res.json(data)
}

export const createBarber = async (req: Request, res: Response) => {
  const { name, nombre } = req.body

  const { data, error } = await supabase
    .from('barbers')
    .insert([{ name: name ?? nombre, active: true }])
    .select()

  if (error) {
    if (isMissingColumnError(error)) {
      const fallback = await supabase
        .from('barbers')
        .insert([{ name: name ?? nombre }])
        .select()

      if (fallback.error) return res.status(500).json({ error: fallback.error })

      invalidateAppDataCache()
      return res.json(fallback.data?.[0])
    }

    return res.status(500).json({ error })
  }

  invalidateAppDataCache()

  return res.json(data?.[0])
}

export const deleteBarber = async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('barbers')
    .update({ active: false })
    .eq('id', id)
    .select()

  if (error) {
    if (isMissingColumnError(error)) return missingMigrationResponse(res, 'barbers')
    return res.status(500).json({ error })
  }

  invalidateAppDataCache()

  return res.json(data?.[0])
}
