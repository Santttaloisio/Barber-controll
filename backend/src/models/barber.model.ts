import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

export const Barber = sequelize.define('Barber', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
})