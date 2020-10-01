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
        username: {
            type: Sequelize.STRING
          }

        },{
        
    hooks : {
        beforeCreate : (users , options) => {
            {
                users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
            }
        },

        }
        });
        

    return Users;
    

}

