const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
    const Files = sequelize.define("file",{
        id:{
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
            },
        s3_object_name: {
            type: Sequelize.STRING
            },
        file_name: {
            type: Sequelize.STRING
            },
        etag: {
            type: Sequelize.STRING
            },
        server_side_encryption: {
            type: Sequelize.STRING
            },
        location: {
            type: Sequelize.STRING
            },
        
         
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
        
    return Files;
    
}
