const sequelize = require('../config/database');
const User = require('./user');
const SalesPerformance = require('./salesPerformance');

const db = {};
db.sequelize = sequelize;
db.User = User;
db.SalesPerformance = SalesPerformance;

sequelize.sync();

module.exports = db;