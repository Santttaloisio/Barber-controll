import { Router } from 'express'
import { getMonthReport, getReport, getYearReport } from '../controllers/report.controller'

const router = Router()

router.get('/', getReport)
router.get('/month', getMonthReport)
router.get('/year', getYearReport)

export default router
