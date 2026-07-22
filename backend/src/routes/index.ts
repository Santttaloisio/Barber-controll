import { Router } from 'express'

import barberRoutes from './barber.routes'
import serviceRoutes from './service.routes'
import cutRoutes from './cut.routes'
import expenseRoutes from './expense.routes'
import reportRoutes from './report.routes'

const router = Router()

router.use('/barbers', barberRoutes)
router.use('/services', serviceRoutes)
router.use('/cuts', cutRoutes)
router.use('/expenses', expenseRoutes)
router.use('/reports', reportRoutes)

export default router