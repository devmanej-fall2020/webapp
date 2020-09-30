const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("users",{
        id:{
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
            },
        first_name: {
                type: Sequelize.STRING
              },
        last_name: {
                type: Sequelize.STRING
              },
        password: {
                type: Sequelize.STRING
              },
        email_address: {
            type: Sequelize.STRING
          }

        },{
        
    hooks : {
        beforeCreate : (users , options) => {
            {
                users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
            }
        },
        // beforeUpdate : (users , options) => {
        //     {
        //         users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
        //     }
        // },
        // afterFind : (users , options) => {
        //     {
        //         users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
        //     }
        // },


        }
        });
        

    return Users;
    

}




// module.exports = function(sequelize, DataTypes) {
//     const User = sequelize.define('users', {
//         annotation_id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         firstName: {
//             type: DataTypes.DATE,
//             field: 'first_name'
//         },
//         lastName: {
//             type: DataTypes.DATE,
//             field: 'last_name'
//         },
//         email: DataTypes.STRING,
//         password: DataTypes.STRING
//     }, {
//         freezeTableName: true,
//         instanceMethods: {
//             generateHash(password) {
//                 return bcrypt.hash(password, bcrypt.genSaltSync(8));
//             },
//             validPassword(password) {
//                 return bcrypt.compare(password, this.password);
//             }
//         }
//     });

//     return User;
// }