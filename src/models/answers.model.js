const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
    const Answers = sequelize.define("answer",{
        id:{
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false
            },
        answer_text: {
            type: Sequelize.STRING
            }
        // question_id:{
        //     type: Sequelize.UUID,
        //     defaultValue: Sequelize.UUIDV4
        //     },
        // user__id:{
        //     type: Sequelize.UUID,
        //     defaultValue: Sequelize.UUIDV4
        //     },
        },{
        
    // hooks : {
    //     beforeCreate : (users , options) => {
    //         {
    //             users.password = users.password && users.password != "" ? bcrypt.hashSync(users.password, 10) : "";
    //         }
    //     },

    //     }
        });
        
    return Answers;
    
}

