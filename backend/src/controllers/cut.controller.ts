import { Request, Response } from 'express'
import { supabase } from '../db/supabase'
import { getAppData, invalidateAppDataCache } from '../services/appData.service'
import { isMissingColumnError, missingMigrationResponse } from '../utils/schemaError'

export const createCut = async (req: Request, res: Response) => {
  const {
    barber_id,
    barberId,
    service_id,
    serviceId,
    price,
    monto,
    payment_method,
    paymentMethod,
    metodoPago,
    observation,
    observacion
  } = req.body

  const payload = {
    barber_id: barber_id ?? barberId,
    service_id: service_id ?? serviceId,
    price: price ?? monto,
    payment_method: payment_method ?? paymentMethod ?? metodoPago,
    observation: observation ?? observacion
  }

  const { data, error } = await supabase
    .from('cuts')
    .insert([payload])
    .select()

  if (error) {
    if (isMissingColumnError(error)) return missingMigrationResponse(res, 'cuts')
    return res.status(500).json({ error })
  }

  invalidateAppDataCache()

  return res.json(data?.[0])
}

export const getCuts = async (_req: Request, res: Response) => {
  try {
    const data = await getAppData()
    return res.json(data.cuts)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
