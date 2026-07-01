import { Router } from 'express'
import {
  getTodayReport,
  getMonthReport,
  getBarberReport,
  getDashboardReport,
  getYearReport
} from '../controllers/report.controller'

const router = Router()

router.get('/dia', getTodayReport)
router.get('/mes', getMonthReport)
router.get('/anio', getYearReport)
router.get('/dashboard', getDashboardReport)
router.get('/barbero/:id', getBarberReport)

export default router