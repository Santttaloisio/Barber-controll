import { Router } from 'express'
import {
  getServices,
  createService,
  deleteService,
  updateServicePrice
} from '../controllers/service.controller'

const router = Router()

router.get('/', getServices)
router.post('/', createService)
router.delete('/:id', deleteService)
router.put('/:id', updateServicePrice)

export default router