import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import barberRoutes from './routes/barber.routes'
import cutRoutes from './routes/cut.routes'
import serviceRoutes from './routes/service.routes'
import expenseRoutes from './routes/expense.routes'
import reportRoutes from './routes/report.routes'
import bootstrapRoutes from './routes/bootstrap.routes'
import authRoutes from './routes/auth.routes'
import { requireAuth } from './middlewares/auth.middleware'

const app = express()

// ======================
// CORS CONFIG (PROD + DEV)
// ======================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://barber-control.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// ======================
// MIDDLEWARES BASE
// ======================
app.use(express.json())

// ======================
// PUBLIC ROUTES
// ======================
app.use('/api/auth', authRoutes)

// ======================
// PROTECT API
// ======================
app.use('/api', requireAuth)

// ======================
// PRIVATE ROUTES
// ======================
app.use('/api/barbers', barberRoutes)
app.use('/api/cuts', cutRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/bootstrap', bootstrapRoutes)

// ======================
// FRONTEND (OPTIONAL RENDER HOST)
// ======================
const frontendDist = path.resolve(__dirname, '../../frontend/dist')

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))

  app.get('/*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

export default app