import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

export const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },

  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },

  monto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  metodoPago: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  observacion: {
    type: DataTypes.STRING,
    allowNull: true
  }
})