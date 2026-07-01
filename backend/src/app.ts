import express from 'express'
import cors from 'cors'
import path from 'path'

import cutRoutes from './routes/cut.routes'
import barberRoutes from './routes/barber.routes'
import serviceRoutes from './routes/service.routes'
import reportRoutes from './routes/report.routes'
import expenseRoutes from './routes/expense.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/cortes', cutRoutes)
app.use('/api/barberos', barberRoutes)
app.use('/api/servicios', serviceRoutes)
app.use('/api/reportes', reportRoutes)
app.use('/api/gastos', expenseRoutes)

const frontendPath = path.resolve(process.cwd(), '../frontend/dist')

app.use(express.static(frontendPath))

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

export default app