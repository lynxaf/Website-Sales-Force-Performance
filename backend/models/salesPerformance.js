const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesPerformance = sequelize.define('SalesPerformance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  namaSF: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kodeSF: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  namaTL: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kodeTL: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  agency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  area: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  regional: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  wok: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  newOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tanggalPS: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = SalesPerformance;