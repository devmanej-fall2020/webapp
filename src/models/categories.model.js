const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
    const Categories = sequelize.define("category",{
        id:{
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
            },
        category: {
                type: Sequelize.STRING,
                unique: true,
              },
        },{
        
    // hooks : {
    //     beforeCreate : (users , options) => {
    //         {
    //             users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
    //         }
    //     },

    //     }
        },);
        
    return Categories;
    
}

