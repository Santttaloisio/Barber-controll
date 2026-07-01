"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Expense = database_1.sequelize.define('Expense', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    categoria: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    monto: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    metodoPago: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    observacion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    }
});
