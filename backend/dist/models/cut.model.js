"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cut = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
exports.Cut = database_1.sequelize.define('Cut', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    monto: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    metodoPago: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    observacion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
});
