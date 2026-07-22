import { Router } from 'express'
import {
  getBarbers,
  createBarber,
  deleteBarber
} from '../controllers/barber.controller'

const router = Router()

router.get('/', getBarbers)
router.post('/', createBarber)
router.delete('/:id', deleteBarber)

export default router