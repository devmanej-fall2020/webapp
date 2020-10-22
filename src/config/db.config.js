module.exports = {
    HOST:process.env.RDS_DB_HOSTNAME,
    PORT:3306,
    USER: process.env.RDS_DB_USERNAME,
    PASSWORD: process.env.RDS_DB_PASSWORD,
    DB:process.env.RDS_DB_NAME,
    dialect:"mysql",
    pool:{
        max:5,
        min:0,
        idle:30000,
        acquire: 60000
    }
};


//REMEMBER TO REMOVE THIS BEFORE DEPLOYMENT TO SERVER

// module.exports = {
//     HOST:"localhost",
//     PORT:3306,
//     USER: "root",
//     PASSWORD: "mypassword",
//     DB:"users",
//     dialect:"mysql",
//     pool:{
//         max:5,
//         min:0,
//         idle:30000,
//         acquire: 60000
//     }
// };