import {Sequelize} from "sequelize";

const db = new Sequelize('tracker_salesforce', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});

export default db;