"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Barber = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Barber = database_1.sequelize.define('Barber', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
});
