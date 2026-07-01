export const formatMoney = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value)
}

export const formatDate = (date: string) => {
  if (date.includes('T')) {
    return new Date(date).toLocaleDateString('es-AR')
  }

  const [year, month, day] = date.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString('es-AR')
}