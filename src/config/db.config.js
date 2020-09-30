module.exports = {
    HOST:"localhost",
    PORT:3306,
    USER: "root",
    PASSWORD: "mypassword",
    DB:"users",
    dialect:"mysql",
    pool:{
        max:5,
        min:0,
        idle:30000,
        acquire: 60000
    }
};