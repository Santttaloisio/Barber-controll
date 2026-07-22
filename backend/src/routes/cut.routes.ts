import { Router } from 'express'
import { createCut, getCuts } from '../controllers/cut.controller'

const router = Router()

router.get('/', getCuts)
router.post('/', createCut)

export default router