export const isMissingColumnError = (error: any) => {
  const message = String(error?.message ?? error?.details ?? '')
  return error?.code === 'PGRST204'
    || message.includes('Could not find')
    || message.includes('column')
}

export const missingMigrationResponse = (res: any, table: string) => {
  return res.status(400).json({
    message: `Faltan columnas en la tabla ${table}. Ejecuta backend/supabase-migration.sql en Supabase.`
  })
}
