const database_config = require ("../config/db.config.js");

const Sequelize = require ("sequelize");

const sequelize = new Sequelize(database_config.DB,database_config.USER,database_config.PASSWORD,{
    host: database_config.HOST,
    port: database_config.PORT,
    dialect: database_config.dialect,
    //operatorsAliases:false,

    pool:{
        max: database_config.max,
        min: database_config.min,
        acquire: database_config.acquire,
        idle: database_config.idle
    }
});

const database = {};

database.Sequelize = Sequelize;
database.sequelize = sequelize;

database.users = require("./users.model.js")(sequelize,Sequelize);
module.exports = database;