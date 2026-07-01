"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
require("./models");
const backupDatabase_1 = require("./utils/backupDatabase");
const PORT = 3000;
const startServer = async () => {
    try {
        await database_1.sequelize.authenticate();
        await database_1.sequelize.sync();
        console.log('Base de datos conectada');
        app_1.default.listen(PORT, async () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
            await (0, backupDatabase_1.startAutomaticBackups)();
        });
    }
    catch (error) {
        console.log('Error al iniciar el servidor', error);
    }
};
startServer();
