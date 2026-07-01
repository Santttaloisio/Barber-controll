"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(process.cwd(), '.env');
dotenv_1.default.config({
    path: envPath
});
const dbName = String(process.env.DB_NAME ?? 'barber_control');
const dbUser = String(process.env.DB_USER ?? 'postgres');
const dbPassword = String(process.env.DB_PASSWORD ?? '');
const dbHost = String(process.env.DB_HOST ?? 'localhost');
const dbPort = Number(process.env.DB_PORT ?? 5432);
if (!dbPassword) {
    throw new Error(`No se encontró DB_PASSWORD en el archivo .env. Ruta buscada: ${envPath}`);
}
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false
});
