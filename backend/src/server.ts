import app from './app'
import { sequelize } from './config/database'
import './models'
import { startAutomaticBackups } from './utils/backupDatabase'

const PORT = 3000

const startServer = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()

    console.log('Base de datos conectada')

    app.listen(PORT, async () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`)

      await startAutomaticBackups()
    })
  } catch (error) {
    console.log('Error al iniciar el servidor', error)
  }
}

startServer()