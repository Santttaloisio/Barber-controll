import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

export const Cut = sequelize.define('Cut', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  metodoPago: {
    type: DataTypes.STRING,
    allowNull: false
  },
  observacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
})