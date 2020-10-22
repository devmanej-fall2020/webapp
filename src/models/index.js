const database_config = require ("../config/db.config.js");

const Sequelize = require ("sequelize");
const { BelongsTo } = require("sequelize");

const sequelize = new Sequelize(database_config.DB || process.env.RDS_DB_NAME,database_config.USER || process.env.RDS_DB_USERNAME,database_config.PASSWORD || process.env.RDS_DB_PASSWORD,{
    host: database_config.HOST || process.env.RDS_DB_HOSTNAME,
    port: database_config.PORT ,
    dialect: database_config.dialect,

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
database.categories = require("./categories.model.js")(sequelize,Sequelize);
database.answers = require("./answers.model.js")(sequelize,Sequelize);
database.questions = require("./questions.model.js")(sequelize,Sequelize);
database.files = require("./files.model.js")(sequelize,Sequelize);

// database.questions_category = require("./question_category.model.js")(sequelize,Sequelize);


User = database.users;
Category = database.categories;
Answer = database.answers;
Question = database.questions;
File = database.files;
// QuestionCategory = database.questions_category;


//user question association
// User.hasMany(Question);
User.hasMany(Question,{    
    as:'questions',    
    foreignKey:{name: 'user_id'}});
// Question.belongsTo(User);



//question answer association
Question.hasMany(Answer);
// Answer.belongsTo(Question, {
//     foreignKey: "questionId",
//     as:"question",
// });
// Answer.hasOne(Question);
// Answer.hasMany(Question);
// Question.belongsTo(Answer);


// const QuestionCategory = database.define('question_category', {});

//question categories association
Question.belongsToMany(Category, {
    through: 'question_category',
    foreignKey:"questionId"
    });

Category.belongsToMany(Question, {
    through: 'question_category',
    foreignKey:"categoryId"
    });

// Setup a One-to-Many relationship between User and Grant
// User.hasMany(Grant);
// Grant.belongsTo(User);

// Setup a One-to-Many relationship between Question and QuestionCategory
// Question.hasMany(QuestionCategory);
// QuestionCategory.belongsTo(Question);


// Also setup a One-to-Many relationship between Profile and Grant
// Profile.hasMany(Grant);
// Grant.belongsTo(Profile);

// Also setup a One-to-Many relationship between Category and QuestionCategory
// Category.hasMany(QuestionCategory);
// QuestionCategory.belongsTo(Category);


//user answer association
User.hasMany(Answer);


// Answer.belongsTo(User);
// User.hasOne(Answer);

// Question.belongsToMany(File, {
//     through: 'question_file',
//     foreignKey:"questionId"
//     });

// File.belongsToMany(Question, {
//     through: 'question_file',
//     foreignKey:"fileId"
//     });

// Question.hasMany(File);
// File.belongsTo(Question);



// Answer.hasMany(File);
// File.belongsTo(Answer);

File.belongsTo(User, {
    foreignKey: "userId",
  })
  
File.belongsTo(Question, {
    foreignKey: "questionId",
  })
  
  File.belongsTo(Answer, {
    foreignKey: "answerId",
  })

  Question.hasMany(File, { onDelete: "cascade" });
  Answer.hasMany(File, { onDelete: "cascade" });











module.exports = database;