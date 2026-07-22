import { Router } from 'express'
import { getServices, createService, updateService } from '../controllers/service.controller'

const router = Router()

router.get('/', getServices)
router.post('/', createService)
router.put('/:id', updateService)

export default router
