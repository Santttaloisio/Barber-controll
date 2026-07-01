import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

export const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precioBase: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
})