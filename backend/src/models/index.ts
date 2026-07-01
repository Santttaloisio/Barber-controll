import { Barber } from './barber.model'
import { Service } from './service.model'
import { Cut } from './cut.model'
import { Expense } from './expense.model'

Barber.hasMany(Cut, {
  foreignKey: 'barberId'
})

Cut.belongsTo(Barber, {
  foreignKey: 'barberId'
})

Service.hasMany(Cut, {
  foreignKey: 'serviceId'
})

Cut.belongsTo(Service, {
  foreignKey: 'serviceId'
})

export { Barber, Service, Cut, Expense }