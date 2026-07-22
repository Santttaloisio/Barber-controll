import { Request, Response } from 'express'
import { supabase } from '../db/supabase'
import { invalidateAppDataCache } from '../services/appData.service'
import { isMissingColumnError, missingMigrationResponse } from '../utils/schemaError'

export const getExpenses = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('expenses').select('*')

  if (error) {
    if (isMissingColumnError(error)) return missingMigrationResponse(res, 'expenses')
    return res.status(500).json({ error })
  }

  return res.json(data)
}

export const createExpense = async (req: Request, res: Response) => {
  const {
    category,
    categoria,
    description,
    descripcion,
    amount,
    monto,
    paymentMethod,
    metodoPago,
    date,
    fecha,
    observation,
    observacion
  } = req.body

  const payload = {
    category: category ?? categoria,
    description: description ?? descripcion,
    amount: amount ?? monto,
    payment_method: paymentMethod ?? metodoPago,
    date: date ?? fecha,
    observation: observation ?? observacion
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([payload])
    .select()

  if (error) return res.status(500).json({ error })

  invalidateAppDataCache()

  return res.json(data?.[0])
}

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json({ error })

  invalidateAppDataCache()

  return res.json({ message: 'Expense deleted' })
}
