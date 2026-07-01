import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')

dotenv.config({
  path: envPath
})

const dbName = String(process.env.DB_NAME ?? 'barber_control')
const dbUser = String(process.env.DB_USER ?? 'postgres')
const dbPassword = String(process.env.DB_PASSWORD ?? '')
const dbHost = String(process.env.DB_HOST ?? 'localhost')
const dbPort = Number(process.env.DB_PORT ?? 5432)

if (!dbPassword) {
  throw new Error(`No se encontró DB_PASSWORD en el archivo .env. Ruta buscada: ${envPath}`)
}

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false
})
