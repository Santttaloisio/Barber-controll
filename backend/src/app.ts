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

app.use(cors({
  origin: 'https://barber-control.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/api', requireAuth)

app.use('/api/barbers', barberRoutes)
app.use('/api/cuts', cutRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/bootstrap', bootstrapRoutes)

app.get('/api/ping', (_req, res) => {
  res.json({ ok: true })
})

const frontendDist = path.resolve(__dirname, '../../frontend/dist')

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))

  app.get('/', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

export default app