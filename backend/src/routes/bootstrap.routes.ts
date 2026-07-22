import { Router } from 'express'
import { getBootstrap } from '../controllers/bootstrap.controller'

const router = Router()

router.get('/', getBootstrap)

export default router
