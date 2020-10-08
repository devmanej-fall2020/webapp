const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
    const Questions = sequelize.define("question",{
        id:{
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
            },
        question_text: {
            type: Sequelize.STRING
          }
        },{
        
    // hooks : {
    //     beforeCreate : (users , options) => {
    //         {
    //             users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
    //         }
    //     },

    //     }
        },);
        
        
    return Questions;

    
}
