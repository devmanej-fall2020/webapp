const database = require("../models");
const Users = database.users;
const Category = database.categories;
const Answer = database.answers;
const Question = database.questions;
const Op = database.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require ("sequelize");
const { categories } = require("../models");
const { x } = require("joi");
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const logger = require ('../config/logger.js');
var StatsD = require('node-statsd'),
client = new StatsD();

const saltRounds = 10;

var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});


/////////////////////////////////////////////////////////////////////////////

//Creates new user using body parameters
exports.create = (req,res)=>{

    logger.info('User creation process started');
    client.increment('counter_user_create');
    var user_create_start_time = Date.now();
    


    //defining variables from request body
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const password = req.body.password;
    const username = req.body.username;


     //send 400 if body params are empty
     if((!req.body.username || !req.body.password || !req.body.first_name || !req.body.last_name  )){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            var user_create_end_time = Date.now();
            client.timing('timing_user_create', user_create_end_time - user_create_start_time );
            return;
    }

    // send 400 if email is invalid - email regex check
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(username.match(mailformat))
    {
        
    }
    else
    {
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            var user_create_end_time = Date.now();
            client.timing('timing_user_create', user_create_end_time - user_create_start_time );
            return;
    }
    

    // //strong password check
    var ValidatePassword = require('validate-password');
    var passRegex = new RegExp("\w{9,}");

    var options = {
        enforce: {
            lowercase: true,
            uppercase: true,
            specialCharacters: true,
            numbers: true
        }
    };

    var validator = new ValidatePassword(options);
    var passwordData = validator.checkPassword(password);

    console.log(passwordData.isValid); // false
    console.log(passwordData.validationMessage); // 'The password must contain at least one uppercase letter'

    if(passwordData.isValid && password.length >= 8){

    }
    else{
                res.status(400).send(
                {
                    Error: "400 Bad Request"
                });
                logger.warn('Bad Request');
                var user_create_end_time = Date.now();
                client.timing('timing_user_create', user_create_end_time - user_create_start_time );
                return;
    }

    var db_findall_user_create_start_time = Date.now();
    
    //checking to see if user already exists in system, if exists throw error code 400
    Users.findAll({
        where: {
            username:{
                [Op.eq]: `${username}`
            }
        },
        raw:true,
    })
    .then(data=>{
        var db_findall_user_create_end_time = Date.now();
        // console.log("userdatacheck"+ data);
        // console.log(JSON.stringify(data));
        if(data.length != 0){
            res.status(400).send({
                Error:"400 Bad Request"
            });
            logger.warn('Bad Request');
            client.timing('timing_db_findall_user_create', db_findall_user_create_end_time - db_findall_user_create_start_time );
            var user_create_end_time = Date.now();
            client.timing('timing_user_create', user_create_end_time - user_create_start_time );
            return;
            
        }
        else{

            var db_create_user_create_start_time = Date.now();
            Users.create(users)
        .then(data=>{
            var db_create_user_create_end_time = Date.now();

            return data;
        })
        .then(data =>{
            data = JSON.parse(JSON.stringify(data));
            delete data.password;
            console.log((data));
            res.status(201).send(data);
        })
        .catch(err=>{

            res.status(400).send({
                Error:"400 Bad Request"
            });
            logger.warn('Bad Request');
            var db_create_user_create_end_time = Date.now();

            client.timing('timing_db_create_user', db_create_user_create_end_time - db_create_user_create_start_time );
            client.timing('timing_db_findall_user_create', db_findall_user_create_end_time - db_findall_user_create_start_time );
            var user_create_end_time = Date.now();
            client.timing('timing_user_create', user_create_end_time - user_create_start_time );

            return;
        });
        }
    })
    .catch(err=>{
        res.status(400).send({
            Error:"400 Bad Request"
        });
        logger.warn('Bad Request');
        var db_findall_user_create_end_time = Date.now();
        client.timing('timing_db_findall_user_create', db_findall_user_create_end_time - db_findall_user_create_start_time );
        var user_create_end_time = Date.now();
        client.timing('timing_user_create', user_create_end_time - user_create_start_time );

        return;
    });
    



    const users = {
            first_name: req.body.first_name,
          last_name: req.body.last_name,
          password: req.body.password,
            username:req.body.username,
    }

    logger.info('User creation process ended');
    var user_create_end_time = Date.now();
    client.timing('timing_user_create', user_create_end_time - user_create_start_time );
    client.timing('timing_db_create_user', db_create_user_create_end_time - db_create_user_create_start_time );
    client.timing('timing_db_findall_user_create', db_findall_user_create_end_time - db_findall_user_create_start_time );


};

//parses authorization header
function parseHeader(header){
    const base64Creds = header.split(' ')[1];
    console.log(base64Creds);
    const creds = Buffer.from(base64Creds, 'base64').toString('ascii');
    console.log(creds);
    return creds;
}

/////////////////////////////////////////////////////////////////////////////

//Gets user info from database
exports.findUser = (req,res) =>{

    logger.info('Find user process started');
    client.increment('counter_user_find');
    var user_find_start_time = Date.now();

    if (!req.headers.authorization) {
        res.status(403).send({ Error: 'No credentials sent!' });
        logger.warn('Bad Request');
        var user_find_end_time = Date.now();
        client.timing('timing_user_find', user_find_end_time - user_find_start_time );
        return;
    }

    creds = parseHeader(req.headers.authorization);

    const[username,password] = creds.split(':');
    // console.log(username);
    // console.log(password);

    // console.log(req.headers.authorization);

    function hasAccess(result,data){
        // console.log(JSON.stringify(data));
        if (result) {
            delete data.password;
          // insert login code here
        //   console.log("Access Granted!");
          res.send(data);
        }
        else {
          // insert access denied code here
        //   console.log("Access Denied!");
          res.status(400).send({
            Error:"400 Bad Request"
        });
        logger.warn('Bad Request');

        }
      }
    
    var db_findOne_user_find_start_time = Date.now();
    Users.findOne({
        where: {
            username:{
                [Op.eq]: `${username}`
            }
        },
        raw:true,
    })
    .then(data=>{
        var db_findOne_user_find_end_time = Date.now();
        // console.log(data);
        if(data.length != 0){
            bcrypt.compare(password, data.password, function(err, result) {
                console.log(result);
                // console.log("err"+err);
                hasAccess(result,data);
            });
        }
        else{
            throw err;
        }
    })
    .catch(err=>{
        res.status(400).send({
            Error:"400 Bad Request"
        });
        logger.warn('Bad Request');
        var db_findOne_user_find_end_time = Date.now();
        client.timing('timing_db_findOne_user_find', db_findOne_user_find_end_time - db_findOne_user_find_start_time );
        var user_find_end_time = Date.now();
        client.timing('timing_user_find', user_find_end_time - user_find_start_time );
    });

    logger.info('Find user process ended');
    var user_find_end_time = Date.now();
    client.timing('timing_user_find', user_find_end_time - user_find_start_time );
    client.timing('timing_db_findOne_user_find', db_findOne_user_find_end_time - db_findOne_user_find_start_time );



};

/////////////////////////////////////////////////////////////////////////////

//Updates User
exports.update = (req,res)=>{

    logger.info('User update process started');
    client.increment('counter_user_update');
    var user_update_start_time = Date.now();

    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        logger.warn('Bad Request');
        logger.info('User update process ended');
        var user_update_end_time = Date.now();
        client.timing('timing_user_update', user_update_end_time - user_update_start_time );
        return;
    }

    //send 400 if body params are empty
    if((!req.body.password || !req.body.first_name || !req.body.last_name  )){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('User update process ended');
            var user_update_end_time = Date.now();
            client.timing('timing_user_update', user_update_end_time - user_update_start_time );
            return;
    }

    //attempt to update email, createdon, updatedon, send 400
    if((req.body.account_created || req.body.account_updated  )){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('User update process ended');
            var user_update_end_time = Date.now();
            client.timing('timing_user_update', user_update_end_time - user_update_start_time );
            return;
    }        
    
        //strong password check
        var ValidatePassword = require('validate-password');
        var passRegex = new RegExp("\w{9,}");
    
        var options = {
            enforce: {
                lowercase: true,
                uppercase: true,
                specialCharacters: true,
                numbers: true
            }
        };
    
        var validator = new ValidatePassword(options);
        var passwordData = validator.checkPassword(req.body.password);
    
        console.log(passwordData.isValid); // false
        console.log(passwordData.validationMessage); // 'The password must contain at least one uppercase letter'
    
        if(passwordData.isValid && req.body.password.length >= 8){
    
        }
        else{
                    res.status(400).send(
                    {
                        Error: "400 Bad Request"
                    });
                    logger.warn('Bad Request');
                    logger.info('User update process ended');
                    var user_update_end_time = Date.now();
                    client.timing('timing_user_update', user_update_end_time - user_update_start_time );
                    return;
        }
    



      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
      // console.log(username);
      // console.log(password);
  
      // console.log(req.headers.authorization);
  
      function hasAccess(result,data){
        
          console.log(JSON.stringify(data));
          
        }
      
        var db_findOne_user_update_start_time = Date.now();
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data=>{
        var db_findOne_user_update_end_time = Date.now();
        client.timing('timing_db_findOne_user_update', db_findOne_user_update_end_time - db_findOne_user_update_start_time );

        

        //   console.log(data);
          if(data.length != 0){
              bcrypt.compare(h_password, data.password, function(err, result) {
                  console.log(result);
                  // console.log("err"+err);
                  if (result) {
                    
                        // console.log(JSON.stringify(users));

                        bcrypt.hash(req.body.password,10).then(function(hash) {
                            req.body.password = hash;
                            console.log("reqbodypass"+req.body.password);

                            var db_update_user_update_start_time = Date.now();

                            Users.update({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                password:req.body.password,
                                }, { where: { 
                                first_name: `${data.first_name}`,
                                last_name:`${data.last_name}`,
                                password:`${data.password}`,
                            }})
                            .then(() => {
                                
                                var db_update_user_update_end_time = Date.now();
                                client.timing('timing_db_update_user_update', db_update_user_update_end_time - db_update_user_update_start_time );

                                
                                return Users.findOne({
                                where: {
                                    username:{
                                        [Op.eq]: `${data.username}`
                                    }
                                },
                                raw:true,
                            })
                            .then(data=>{
                                
                                  delete data.password;
                                res.send(data);
                            })
                            })
                            .catch(err=>{
                                res.status(400).send({
                                    Error: "400 Bad Request"
                                });
                                logger.warn('Bad Request');
                                var db_update_user_update_end_time = Date.now();
                                client.timing('timing_db_update_user_update', db_update_user_update_end_time - db_update_user_update_start_time );
                            });
                          
                            
                          }); 


                    
                    // insert login code here
                  //   console.log("Access Granted!");
                  }
                  else {
                    // insert access denied code here
                  //   console.log("Access Denied!");
                    res.status(400).send({
                      Error:"400 Bad Request"
                  });
                  logger.warn('Bad Request');
                  }
                  //hasAccess(result,data);
              });
          }
          else{
              throw err;
          }
      })
      .catch(err=>{
          res.status(400).send({
              Error:"400 Bad Request"
          });
          logger.warn('Bad Request');
          var db_findOne_user_update_end_time = Date.now();
          client.timing('timing_db_findOne_user_update', db_findOne_user_update_end_time - db_findOne_user_update_start_time );
      });


      logger.info('User update process ended');
      var user_update_end_time = Date.now();
      client.timing('timing_user_update', user_update_end_time - user_update_start_time );
      client.timing('timing_db_findOne_user_update', db_findOne_user_update_end_time - db_findOne_user_update_start_time );
      client.timing('timing_db_update_user_update', db_update_user_update_end_time - db_update_user_update_start_time );



};


/////////////////////////////////////////////////////////////////////////////


exports.findUserById = (req,res) =>{

    logger.info('User findById process started');
    client.increment('counter_user_findById');
    var user_findById_start_time = Date.now();

    const id = req.params.id;
    
    // if (!req.headers.authorization) {
    //     res.status(403).send({ Error: 'No credentials sent!' });
    //     return;
    // }

    // creds = parseHeader(req.headers.authorization);

    // const[username,password] = creds.split(':');
    // console.log(username);
    // console.log(password);

    // console.log(req.headers.authorization);

    // function hasAccess(result,data){
    //     // console.log(JSON.stringify(data));
    //     if (result) {
    //         delete data.password;
    //       // insert login code here
    //     //   console.log("Access Granted!");
    //       res.send(data);
    //     }
    //     else {
    //       // insert access denied code here
    //     //   console.log("Access Denied!");
    //       res.status(400).send({
    //         Error:"400 Bad Request"
    //     });
    //     }
    //   }
    
    var db_findByPk_user_findById_start_time = Date.now();
    Users.findByPk(id)
    .then(data=>{
        var db_findByPk_user_findById_end_time = Date.now();
        client.timing('timing_db_findByPk_user_findById', db_findByPk_user_findById_end_time - db_findByPk_user_findById_start_time );
        console.log(data);
        if(data.length != 0){
            data = JSON.parse(JSON.stringify(data));
            delete data.password;
            res.send(data);
            // hasAccess(result,data);
            // bcrypt.compare(password, data.password, function(err, result) {
            //     console.log(result);
            //     // console.log("err"+err);
            // });
        }
        else{
            throw err;
        }
    })
    .catch(err=>{
        res.status(400).send({
            Error:"400 Bad Request"
        });
        logger.warn('Bad Request');
        var db_findByPk_user_findById_end_time = Date.now();
        client.timing('timing_db_findByPk_user_findById', db_findByPk_user_findById_end_time - db_findByPk_user_findById_start_time );

    });

    logger.info('User findById process ended');
    var user_findById_end_time = Date.now();
    client.timing('timing_user_findById', user_findById_end_time - user_findById_start_time );
    client.timing('timing_db_findByPk_user_findById', db_findByPk_user_findById_end_time - db_findByPk_user_findById_start_time );

};


////////////////////////////////////////////////////////////////////////////////

//Creates question with authenticated user endpoint
exports.createQuestion = async (req,res)=>{

    logger.info('Question creation process started');
    client.increment('counter_question_create');
    var question_create_start_time = Date.now();

    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        logger.warn('Bad Request');
        logger.info('Question creation process ended');
        var question_create_end_time = Date.now();
        client.timing('timing_question_create', question_create_end_time - question_create_start_time );
        return;
    }

    //send 400 if body params are empty
    if((!req.body.question_text || !req.body.categories )){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('Question creation process ended');
            var question_create_end_time = Date.now();
            client.timing('timing_question_create', question_create_end_time - question_create_start_time );
            return;
    }

    const questions = {
        question_text: req.body.question_text,
        categories: req.body.categories,
    }

    catArray = [];

    cleanedCategories = req.body.categories.map(item=>{
        catArray.push(item);
    });

    console.log("catarray");
    console.log(catArray);



      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
  
      // console.log(req.headers.authorization);
      
      var db_findOne_question_create_start_time = Date.now();
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data=>{
        var db_findOne_question_create_end_time = Date.now();
        client.timing('timing_db_findOne_question_create', db_findOne_question_create_end_time - db_findOne_question_create_start_time );

          //console.log(data);
        // data_user_id = data.id;
          if(data.length != 0){
              bcrypt.compare(h_password, data.password, async function(err, result) {
                  console.log(result);
                  // console.log("err"+err);
                  if (result) {
                    //insert question post code here
                    
                    let q_id;
                
                    var db_create_question_create_start_time = Date.now();
                    let question = await Question.create({
                        question_text: req.body.question_text,
                        user_id: `${data.id}`,
                        // categories:  catArray,                    
                        }
                        // ,{include: Category},
                      );

                    var db_create_question_create_end_time = Date.now();
                    client.timing('timing_db_create_question_create', db_create_question_create_end_time - db_create_question_create_start_time );
                      


                    if(req.body.categories){
            
            
                        for(i=0;i<catArray.length;i++){
                            singleCat = catArray[i];
                            console.log(singleCat)

                            let [addedCategory, created] = await Category.findOrCreate({
                                where: {category: singleCat.category.toLowerCase() },
                                defaults: {
                                    id:uuidv4(),
                                }
                            });
                            
                            console.log(addedCategory); 
                            await question.addCategory(addedCategory);
                        }


                        
                    }



                          question1 = JSON.parse(JSON.stringify(question));
                          console.log("question");
                          console.log(question)



                            Question.findByPk(question1.id, {
                                include: [
                                {model: Category, as: "categories", attributes: ["id", "category"],through: {attributes: []} },
                                {model: Answer, as: "answers", attributes: ["id", "userId", "questionId", "createdAt", "updatedAt", "answer_text"]},
                                {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}
                            ]
                            }).then(result =>{
                                //result = JSON.parse(JSON.stringify(result));
                                result = JSON.stringify(result);
                                result = result.replace("files", "attachments");
                                result = JSON.parse(result);
                                console.log(result);
                                return res.status(201).json(result)
                            }).catch(err=>{
                                res.status(400).send({
                                    Error:"400 Bad Request"
                                });
                                logger.info('Question creation process ended');
                                var question_create_end_time = Date.now();
                                client.timing('timing_question_create', question_create_end_time - question_create_start_time );
                                return;
                            });

                    
                    // insert login code here
                  //   console.log("Access Granted!");
                  }
                  else {
                    // insert access denied code here
                  //   console.log("Access Denied!");
                    res.status(401).send({
                      Error:"401 Unauthorized"
                  });
                  }
                  //hasAccess(result,data);
              });
          }
          else{
              throw err;
          }
      })
      .catch(err=>{
          res.status(400).send({
              Error:"400 Bad Request"
          });
          var db_findOne_question_create_end_time = Date.now();
          client.timing('timing_db_findOne_question_create', db_findOne_question_create_end_time - db_findOne_question_create_start_time );
      });

      logger.info('Question creation process ended');
      var question_create_end_time = Date.now();
      client.timing('timing_question_create', question_create_end_time - question_create_start_time );
      client.timing('timing_db_findOne_question_create', db_findOne_question_create_end_time - db_findOne_question_create_start_time );
      client.timing('timing_db_create_question_create', db_create_question_create_end_time - db_create_question_create_start_time );

};


///////////////////////////////////////////////////////////////
// Find user by user_id - Unauthenticated

exports.findUserById = (req,res) =>{

    logger.info('User findById process started');
    client.increment('counter_user_findById');
    var user_findById_start_time = Date.now();


    const id = req.params.id;

   
    //   }
    
    var db_findByPk_user_findById_start_time = Date.now();
    Users.findByPk(id)
    .then(data=>{
        var db_findByPk_user_findById_end_time = Date.now();
        client.timing('timing_db_findByPk_user_findById', db_findByPk_user_findById_end_time - db_findByPk_user_findById_start_time );
        console.log(data);
        if(data.length != 0){
            data = JSON.parse(JSON.stringify(data));
            delete data.password;
            res.send(data);
        }
        else{
            throw err;
        }
    })
    .catch(err=>{
        res.status(400).send({
            Error:"400 Bad Request"
        });
        logger.warn('Bad Request');
        logger.info('User findById process ended');
        var db_findByPk_user_findById_end_time = Date.now();
        client.timing('timing_db_findByPk_user_findById', db_findByPk_user_findById_end_time - db_findByPk_user_findById_start_time );

    });

    logger.info('User findById process ended');
    var user_findById_end_time = Date.now();
    client.timing('timing_user_findById', user_findById_end_time - user_findById_start_time );
    client.timing('timing_db_findByPk_user_findById', db_findByPk_user_findById_end_time - db_findByPk_user_findById_start_time );

};

///////////////////////////////////////////////////
// Find question by question_id - Unauthenticated
exports.findQuestionById = (req,res) =>{

    logger.info('Question findById process started');
    client.increment('counter_question_findById');
    var question_findById_start_time = Date.now();

    const id = req.params.question_id;

    var db_findByPk_question_findById_start_time = Date.now();
    Question.findByPk(id, {
        include: [
        {model: Category, as: "categories", attributes: ["id", "category"], through: {attributes: []}},
        {model: Answer, as: "answers", attributes: ["id", "userId", "questionId", "createdAt", "updatedAt", "answer_text"]},
        {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}

    ]
    }).then(result =>{
        var db_findByPk_question_findById_end_time = Date.now();
        client.timing('timing_db_findByPk_question_findById', db_findByPk_question_findById_end_time - db_findByPk_question_findById_start_time );

        if(result == null){
            throw err;
        }
        result = JSON.stringify(result);
        result = result.replace("files", "attachments");
        result = JSON.parse(result);
        // result = JSON.parse(JSON.stringify(result));
        console.log(result);
        return res.status(200).json(result)
    }).catch(err=>{
        res.status(404).send({
            Error:"404 Not Found"
        });
        logger.warn('Not Found');
        logger.info('Question findById process ended');
        var db_findByPk_question_findById_end_time = Date.now();
        var question_findById_end_time = Date.now();
        client.timing('timing_question_findById', question_findById_end_time - question_findById_start_time );
        client.timing('timing_db_findByPk_question_findById', db_findByPk_question_findById_end_time - db_findByPk_question_findById_start_time );
        return;
    });
    
    logger.info('Question findById process ended');
    var question_findById_end_time = Date.now();
    client.timing('timing_question_findById', question_findById_end_time - question_findById_start_time );
    client.timing('timing_db_findByPk_question_findById', db_findByPk_question_findById_end_time - db_findByPk_question_findById_start_time );

    

};

////////////////////////////////////////////////
// Find all questions - Unauthenticated
exports.findAllQuestions = (req,res) =>{

    logger.info('Question find all process started');
    client.increment('counter_question_findAll');
    var question_findAll_start_time = Date.now();


    var db_findAll_question_findAll_start_time = Date.now();
    Question.findAll({
        include: [
        {model: Category, as: "categories", attributes: ["id", "category"], through: {attributes: []}  },
        {model: Answer, as: "answers", attributes: ["id", "userId", "questionId", "createdAt", "updatedAt", "answer_text"]},
        {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}
    ]
    }).then(result =>{
        var db_findAll_question_findAll_end_time = Date.now();
        client.timing('db_findAll_question_findAll', db_findAll_question_findAll_end_time - db_findAll_question_findAll_end_time );
        result = JSON.stringify(result);
        result = result.replace("files", "attachments");
        result = JSON.parse(result);
       console.log(result);
        return res.status(200).json(result)
    }).catch(err=>{
        res.status(400).send({
            Error:"400 Bad Request"
        });
        logger.warn('Bad Request');
        logger.info('Question find all process ended');
        var db_findAll_question_findAll_end_time = Date.now();
        var question_findAll_end_time = Date.now();
        client.timing('timing_question_findAll', question_findAll_end_time - question_findAll_start_time );
        client.timing('db_findAll_question_findAll', db_findAll_question_findAll_end_time - db_findAll_question_findAll_end_time );

        return;
    });

    logger.info('Question find all process ended');
    var question_findAll_end_time = Date.now();
    var db_findAll_question_findAll_end_time = Date.now();
    client.timing('timing_question_findAll', question_findAll_end_time - question_findAll_start_time );
    client.timing('db_findAll_question_findAll', db_findAll_question_findAll_end_time - db_findAll_question_findAll_start_time );


   
};

//////////////////////////////////////////////////////////

//Answer a question - Authenticated

exports.answerQuestion = async (req,res)=>{

    logger.info('Answer a question process started');
    client.increment('counter_answer_answerAQuestion');
    var answer_answerAQuestion_start_time = Date.now();

    const question_id = req.params.question_id;

    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        logger.warn('Bad Request');
        logger.info('Answer a question process ended');
        var answer_answerAQuestion_end_time = Date.now();
        client.timing('timing_answer_answerAQuestion', answer_answerAQuestion_end_time - answer_answerAQuestion_start_time );
        return;
    }

    //send 400 if body params or query params are empty
    if((!req.body.answer_text || !req.params.question_id)){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('Answer a question process ended');
            var answer_answerAQuestion_end_time = Date.now();
            client.timing('timing_answer_answerAQuestion', answer_answerAQuestion_end_time - answer_answerAQuestion_start_time );
            return;
    }


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
  
      // console.log(req.headers.authorization);
      
      var db_findOne_answer_answerAQuestion_start_time = Date.now();
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data=>{
        var db_findOne_answer_answerAQuestion_end_time = Date.now();
        client.timing('timing_db_findOne_answer_answerAQuestion', db_findOne_answer_answerAQuestion_end_time - db_findOne_answer_answerAQuestion_start_time );

          console.log(data);
        // data_user_id = data.id;
          if(data.length != 0){
              bcrypt.compare(h_password, data.password, async function(err, result) {
                  console.log(result);
                  // console.log("err"+err);
                  if (result) {
                    //insert question post code here
                    console.log(data.id);




                    let user = await Users.findOne({
                        where: {
                            username:{
                                [Op.eq]: `${h_username}`
                            }
                        },
                        raw:true,
                    });

                    var db_create_answer_answerAQuestion_start_time = Date.now();
                    let answer_created = await Answer.create({
                        answer_text: req.body.answer_text,
                        userId: `${data.id}`,
                        questionId: `${question_id}`                   
                        }
                      );
                    var db_create_answer_answerAQuestion_end_time = Date.now();
                    client.timing('timing_db_create_answer_answerAQuestion', db_create_answer_answerAQuestion_end_time - db_create_answer_answerAQuestion_start_time );

                    
                    
                    // .then(data=>{
                    //     return data;
                    // })
                    // .then(data =>{
                    //     data = JSON.parse(JSON.stringify(data));
                    //     console.log(data);
                    //     // res.status(201).send(data);
                    // })
                    // .catch(err=>{
                    //     res.status(400).send({
                    //         Error:"400 Bad Request"
                    //     });
                    //     return;
                    // });
                    answer1 = JSON.parse(JSON.stringify(answer_created));

                    console.log(answer1);

                    // await user.addQuestion(question);


                    //console.log(q_add);
                    //console.log(user);
                    //user.addQuestion(q_add);
                    // question.setUser(user);


                    // const testQuestion = Question.create({
                    //     question_text: "test question"
                    // });

                    // const testCategory = Category.create({
                    //     category: "test category"
                    // });

                    // testQuestion.addCategory(testCategory);

                    const ans = Answer.findByPk(answer1.id, {
                        include: [
                            {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}
                    ]
                    }
                        // {model: File, as: "files"}
                        // ,
                    //     {
                    //     include:Category
                    //         // include: [Answer],
                          
                    // }
                    
                    )
                    .then(data =>{
                        //data = JSON.parse(JSON.stringify(data));
                        data = JSON.stringify(data);
                        data = data.replace("files", "attachments");
                        data = JSON.parse(data);
                        // delete data.password;
                        console.log((data));
                        res.send(data);

                    });
                    //console.log(ans);
                    // ques.forEach(ques =>{
                    //     console.log(ques.Category[0])
                    // });

                    // insert login code here
                  //   console.log("Access Granted!");
                  }
                  else {
                    // insert access denied code here
                  //   console.log("Access Denied!");
                    res.status(401).send({
                      Error:"401 Unauthorized"
                  });
                  }
                  //hasAccess(result,data);
              });
          }
          else{
              throw err;
          }
      })
      .catch(err=>{
          res.status(400).send({
              Error:"400 Bad Request"
          });
          var db_findOne_answer_answerAQuestion_end_time = Date.now();
          client.timing('timing_db_findOne_answer_answerAQuestion', db_findOne_answer_answerAQuestion_end_time - db_findOne_answer_answerAQuestion_start_time );

      });

      logger.info('Answer a question process ended');
      var answer_answerAQuestion_end_time = Date.now();
      client.timing('timing_answer_answerAQuestion', answer_answerAQuestion_end_time - answer_answerAQuestion_start_time );
      client.timing('timing_db_findOne_answer_answerAQuestion', db_findOne_answer_answerAQuestion_end_time - db_findOne_answer_answerAQuestion_start_time );
      client.timing('timing_db_create_answer_answerAQuestion', db_create_answer_answerAQuestion_end_time - db_create_answer_answerAQuestion_start_time );


};


//////////////////////////////////////////////////////

//Updates a question's answer - Authenticated

exports.updateAnswer = (req,res)=>{

    logger.info('Update answer process started');
    client.increment('counter_answer_updateAnswer');
    var answer_updateAnswer_start_time = Date.now();

    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        logger.warn('Bad Request');
        logger.info('Update answer process ended');
        var answer_updateAnswer_end_time = Date.now();
        client.timing('timing_answer_updateAnswer', answer_updateAnswer_end_time - answer_updateAnswer_start_time );
        return;
    }

    //send 400 if params are empty
    if((!answer_id || !question_id)){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('Update answer process ended');
            var answer_updateAnswer_end_time = Date.now();
            client.timing('timing_answer_updateAnswer', answer_updateAnswer_end_time - answer_updateAnswer_start_time );
            return;
    }


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
      // console.log(username);
      // console.log(password);
  
      // console.log(req.headers.authorization);
  
      function hasAccess(result,data){
        
          console.log(JSON.stringify(data));
          
        }

      var db_findOne_answer_updateAnswer_start_time = Date.now();
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data => {
        var db_findOne_answer_updateAnswer_end_time = Date.now();
        client.timing('timing_db_findOne_answer_updateAnswer', db_findOne_answer_updateAnswer_end_time - db_findOne_answer_updateAnswer_start_time );
          const currentUser_userId = data.id;
          console.log("loginuser :"+currentUser_userId);
          if(data.length != 0){
            bcrypt.compare(h_password, data.password, function(err, result) {

                if(result){

                    var db_update_answer_updateAnswer_start_time = Date.now();



                    //finding question by pkid
                    Question.findByPk(question_id)
                    .then(data=>{
                        console.log(data);
                        if(data.length != 0){
                            
                                    
                                    //find answer by pkid
                                    Answer.findByPk(answer_id)
                                    .then(data=>{
                                        data = JSON.parse(JSON.stringify(data));
                                        const answerAuthor_userId = data.userId; 
                                        console.log("answeruser :"+answerAuthor_userId);
                                        console.log(data);
                                        answer_ret = data.answer_text;
                                        if(data.length != 0){

                                                //check whether same user who posted answer is updating answer
                                                if(currentUser_userId == answerAuthor_userId ){
                                                    //perform operations


                                                                console.log("answer id found in question table")


                                                                //updating answer_text field from body
                                                                Answer.update({
                                                                answer_text: req.body.answer_text
                                                                        }, {
                                                                            where: {
                                                                                answer_text: `${answer_ret}`
                                                                            }
                                                                        })
                                                                .then(data=> {

                                                                    res.status(204).send({
                                                                        Message:"No Content"
                                                                    });
                                                                    
                                                                    
                                                                })
                                                                .catch(err=>{
                                                                    res.status(404).send({
                                                                        Error:"404 Not Found"
                                                                    });
                                                                }); 


                                                }
                                                else{
                                                    throw err;
                                                }

                                            

                                        }})
                                    .catch(err=>{
                                        res.status(404).send({
                                            Error:"404 Not Found"
                                        });
                                    }); 

                        }})
                    .catch(err=>{
                        res.status(404).send({
                            Error:"404 Not Found"
                            })});

                            var db_update_answer_updateAnswer_end_time = Date.now();
                            client.timing('timing_db_update_answer_updateAnswer', db_update_answer_updateAnswer_end_time - db_update_answer_updateAnswer_start_time );
                            

                }

                else{
                    throw err;

                }

            });


          }
        
      })

      .catch(err=>{
          res.status(404).send({
              Error:"404 Bad Request"
          });
          var db_findOne_answer_updateAnswer_end_time = Date.now();
          client.timing('timing_db_findOne_answer_updateAnswer', db_findOne_answer_updateAnswer_end_time - db_findOne_answer_updateAnswer_start_time );

      });

      logger.info('Update answer process ended');
      var answer_updateAnswer_end_time = Date.now();
      client.timing('timing_answer_updateAnswer', answer_updateAnswer_end_time - answer_updateAnswer_start_time );
      client.timing('timing_db_findOne_answer_updateAnswer', db_findOne_answer_updateAnswer_end_time - db_findOne_answer_updateAnswer_start_time );
      client.timing('timing_db_update_answer_updateAnswer', db_update_answer_updateAnswer_end_time - db_update_answer_updateAnswer_start_time );


};



///////////////////////////////////////////////////////////////////////

//Delete an answer - Authenticated
exports.deleteAnswer = (req,res)=>{

    logger.info('Delete answer process started');
    client.increment('counter_answer_deleteAnswer');
    var answer_deleteAnswer_start_time = Date.now();

    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(404).send({ Error: "404 Not Found" });
        logger.warn('Bad Request');
        logger.info('Delete answer process ended');
        var answer_deleteAnswer_end_time = Date.now();
        client.timing('timing_answer_deleteAnswer', answer_deleteAnswer_end_time - answer_deleteAnswer_start_time );
        return;
    }

    //send 400 if params are empty
    if((!answer_id || !question_id)){
        res.status(404).send(
            {
                Error: "404 Not Found"
            });
            logger.warn('Bad Request');
            logger.info('Delete answer process ended');
            var answer_deleteAnswer_end_time = Date.now();
            client.timing('timing_answer_deleteAnswer', answer_deleteAnswer_end_time - answer_deleteAnswer_start_time );
            return;
    }


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
      // console.log(username);
      // console.log(password);
  
      // console.log(req.headers.authorization);
  
      function hasAccess(result,data){
        
          console.log(JSON.stringify(data));
          
        }


      var db_findOne_answer_deleteAnswer_start_time = Date.now();
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data => {
        var db_findOne_answer_deleteAnswer_end_time = Date.now();
        client.timing('timing_db_findOne_answer_deleteAnswer', db_findOne_answer_deleteAnswer_end_time - db_findOne_answer_deleteAnswer_start_time );
        const currentUser_userId = data.id;
        console.log("loginuser :"+currentUser_userId);
          if(data.length != 0){
            bcrypt.compare(h_password, data.password, function(err, result) {

                if(result){

                    var db_destroy_answer_deleteAnswer_start_time = Date.now();
                    //finding question by pkid
                    Question.findByPk(question_id)
                    .then(data=>{
                        console.log(data);
                        if(data.length != 0){
                                    
                                    //find answer by pkid
                                    Answer.findByPk(answer_id)
                                    .then(data=>{
                                        data = JSON.parse(JSON.stringify(data));
                                        const answerAuthor_userId = data.userId; 
                                        console.log("answeruser :"+answerAuthor_userId);
                                        console.log(data);
                                        answer_ret = data.answer_text;
                                        if(data.length != 0){

                                            //checking whether same user who posted answer is deleting answer. If not throw error.
                                            if(currentUser_userId == answerAuthor_userId ){
                                                console.log("user who posted answer matches with login user. you may delete the question");



                                                console.log("answer id found in question table")

                                                //deleting answer
                                                Answer.destroy({
                                                                where: {
                                                                    id: answer_id
                                                                  }
                                                             })
                                                    .then(data=> {
    
                                                        res.status(204).send({
                                                            Message:"No Content"
                                                        });
                                                        
                                                        
                                                    })
                                                    .catch(err=>{
                                                        res.status(404).send({
                                                            Error:"404 Not Found"
                                                        });
                                                    }); 


                                            }
                                            else{
                                                console.log("user who posted answer does NOT match with login user. you may NOT delete the question");
                                                // throw err;
                                                res.status(401).send({
                                                    Error:"401 Not Authorized"
                                                    });
                                            }


                                        }})
                                    .catch(err=>{
                                        res.status(404).send({
                                            Error:"404 Not Found"
                                        });
                                    }); 

                        }})
                    .catch(err=>{
                        res.status(404).send({
                            Error:"404 Not Found"
                            })});
                            var db_destroy_answer_deleteAnswer_end_time = Date.now();
                            client.timing('timing_db_destroy_answer_deleteAnswer', db_destroy_answer_deleteAnswer_end_time - db_destroy_answer_deleteAnswer_start_time );

                }

                else{
                    // throw err;
                    res.status(401).send({
                        Error:"401 Not Authorized"
                        });

                }

            });


          }
        
      })

      .catch(err=>{
          res.status(404).send({
              Error:"404 Bad Request"
          });
          var db_findOne_answer_deleteAnswer_end_time = Date.now();
          client.timing('timing_db_findOne_answer_deleteAnswer', db_findOne_answer_deleteAnswer_end_time - db_findOne_answer_deleteAnswer_start_time );
  
      });

      logger.info('Delete answer process ended');
      var answer_deleteAnswer_end_time = Date.now();
      client.timing('timing_answer_deleteAnswer', answer_deleteAnswer_end_time - answer_deleteAnswer_start_time );
      client.timing('timing_db_findOne_answer_deleteAnswer', db_findOne_answer_deleteAnswer_end_time - db_findOne_answer_deleteAnswer_start_time );
      client.timing('timing_db_destroy_answer_deleteAnswer', db_destroy_answer_deleteAnswer_end_time - db_destroy_answer_deleteAnswer_start_time );


};

//////////////////////////////////////////////////////////////////////

//Delete a question - Authenticated

exports.deleteQuestion = (req,res)=>{

    logger.info('Delete question process started');
    client.increment('counter_question_deleteQuestion');
    var question_deleteQuestion_start_time = Date.now();

    const question_id = req.params.question_id;


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        logger.warn('Bad Request');
        logger.info('Delete question process ended');
        var question_deleteQuestion_end_time = Date.now();
        client.timing('timing_question_deleteQuestion', question_deleteQuestion_end_time - question_deleteQuestion_start_time );
        return;
    }

    //send 400 if params are empty
    if((!question_id)){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('Delete question process ended');
            var question_deleteQuestion_end_time = Date.now();
            client.timing('timing_question_deleteQuestion', question_deleteQuestion_end_time - question_deleteQuestion_start_time );
            return;
    }


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
      // console.log(username);
      // console.log(password);
  
      // console.log(req.headers.authorization);
  
      function hasAccess(result,data){
        
          console.log(JSON.stringify(data));
          
        }

      var db_findOne_question_deleteQuestion_start_time = Date.now();
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data => {
        var db_findOne_question_deleteQuestion_end_time = Date.now()
        client.timing('timing_db_findOne_question_deleteQuestion', db_findOne_question_deleteQuestion_end_time - db_findOne_question_deleteQuestion_start_time );
        const currentUser_userId = data.id;
        console.log("loginuser :"+currentUser_userId);
          if(data.length != 0){
            bcrypt.compare(h_password, data.password, function(err, result) {

                        if(result){

                                      
                            var db_destroy_question_deleteQuestion_start_time = Date.now()
                    
                            Question.findByPk(question_id, {
                                include: [
                                {model: Category, as: "categories", attributes: ["id", "category"], through: {attributes: []}},
                                {model: Answer, as: "answers", attributes: ["id", "userId", "questionId", "createdAt", "updatedAt", "answer_text"]}
                            ]
                            }).then(result =>{

                                        



                                result = JSON.parse(JSON.stringify(result));
                                console.log(result);

                                const questionAuthor_userId = result.user_id; 
                                console.log("questionuser :"+questionAuthor_userId);

                                ansVerify = result.answers.length;
                                console.log(ansVerify);

                                //checking if question has one or more answers, if it does, cannot be deleted
                                if(ansVerify == 0){
                                    //delete question


                                    //checking whether user who posted question is same one who is trying to delete
                                    if(currentUser_userId == questionAuthor_userId){
                                        console.log("user match.you can delete answer.")
                                        //perform operations



                                            //deleting question
                                            Question.destroy({
                                                where: {
                                                id: question_id
                                                }
                                            })
                                            .then(data=> {
                                                console.log("question deleted")

                                                res.status(204).send({
                                                    Message:"No Content"
                                                });
                                                
                                                
                                            })
                                            .catch(err=>{
                                                res.status(404).send({
                                                    Error:"401 Not Found"
                                                });
                                            }); 



                                    }
                                    else{
                                        console.log("user not match.you cannot delete answer");
                                        // throw err;
                                        res.status(401).send({
                                            Error:"401 Not Authorized"
                                            });

                                    }

   


                                }
                                else{
                                    console.log("question cannot be deleted. it has answers")
                                    //throw 404
                                    throw err;
                                }
                                
                            }).catch(err=>{
                                res.status(404).send({
                                    Error:"404 Not Found"
                                });
                                return;
                            });
                            var db_destroy_question_deleteQuestion_end_time = Date.now();
                            client.timing('timing_db_destroy_question_deleteQuestion', db_destroy_question_deleteQuestion_end_time - db_destroy_question_deleteQuestion_start_time );


                        }

                        else{
                            // throw err;
                            res.status(401).send({
                                Error:"401 Not Authorized"
                                });

                        }

            });


          }
        
      })

      .catch(err=>{
          res.status(404).send({
              Error:"404 Not Found"
          });
          var db_findOne_question_deleteQuestion_end_time = Date.now();
          client.timing('timing_db_findOne_question_deleteQuestion', db_findOne_question_deleteQuestion_end_time - db_findOne_question_deleteQuestion_start_time );

      });

      logger.info('Delete question process ended');
      var question_deleteQuestion_end_time = Date.now();
      client.timing('timing_question_deleteQuestion', question_deleteQuestion_end_time - question_deleteQuestion_start_time );
      client.timing('timing_db_findOne_question_deleteQuestion', db_findOne_question_deleteQuestion_end_time - db_findOne_question_deleteQuestion_start_time );
      client.timing('timing_db_destroy_question_deleteQuestion', db_destroy_question_deleteQuestion_end_time - db_destroy_question_deleteQuestion_start_time );


};


///////////////////////////////////////////////////////////////////////

//Update a question
exports.updateQuestion = async (req,res)=>{

    logger.info('Update question process started');
    client.increment('counter_question_updateQuestion');
    var question_updateQuestion_start_time = Date.now();


    const question_id = req.params.question_id;
    


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        logger.warn('Bad Request');
        logger.info('Update question process ended');
        var question_updateQuestion_end_time = Date.now();
        client.timing('timing_question_updateQuestion', question_updateQuestion_end_time - question_updateQuestion_start_time );
        return;
    }



    //send 400 if params are empty
    if((!question_id || !req.body.question_text)){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            logger.info('Update question process ended');
            var question_updateQuestion_end_time = Date.now();
            client.timing('timing_question_updateQuestion', question_updateQuestion_end_time - question_updateQuestion_start_time );
            return;
    }
    const {question_text, categories} = req.body;

    catArray = [];

    cleanedCategories = req.body.categories.map(item=>{
        catArray.push(item);
    });


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
      // console.log(username);
      // console.log(password);
  
      // console.log(req.headers.authorization);
  
      function hasAccess(result,data){
        
          console.log(JSON.stringify(data));
          
        }

        checkAuth = await Users.findOne({
            where: {
                username:{
                    [Op.eq]: `${h_username}`
                }
            },
            raw:true,
        });
        console.log(checkAuth);
        
        if(!checkAuth) return res.status(401).send({Error: "Unauthorized" });

        const currentUser_userId = checkAuth.id;
        console.log("loginuser :"+currentUser_userId);

        bcrypt.compare(h_password, checkAuth.password, async function (err, result) {

                if(result){

                    var db_update_question_updateQuestion_start_time = Date.now();
                    console.log("user in database");


                        let questionObject = await Question.findByPk(req.params.question_id);
                        questionObject = JSON.parse(JSON.stringify(questionObject));
                        // console.log("questionObject");
                        // console.log(questionObject);
                        const questionAuthor_userId = questionObject.user_id; 
                        console.log("answeruser :"+questionAuthor_userId);

                        //checking - only same user who posted question is able to update it
                        if(currentUser_userId == questionAuthor_userId ){
                            console.log("user who posted and user who is updating is same, hence can update");

                            //perform operations


                                    let updatedQText = await Question.update({question_text: req.body.question_text}, 
                                
                                        {where: {
                                    id: question_id,
                                    }});
            
                                    let updatedQ = await Question.findByPk(req.params.question_id);
            
                                    
            
                                    console.log(updatedQ);
                                    console.log(await updatedQ.setCategories([]));
            
            
                                    if(req.body.categories){
            
            
                                        for(i=0;i<catArray.length;i++){
                                            singleCat = catArray[i];
                                            console.log(singleCat);
                                            
                
                                            let [addedCategory, created] = await Category.findOrCreate({
                                                where: {category: singleCat.category.toLowerCase() },
                                                defaults: {
                                                    id:uuidv4(),
                                                }
                                            });
                                            
                                            console.log(addedCategory); 
                                            await updatedQ.addCategory(addedCategory);
                                        }
                
                
                                        console.log(updatedQText);
            
                                        res.status(204).send({});
            
                                    }





                        }
                        else{
                            console.log("user who posted and user who is updating is not same, hence cannot update");
                            return res.status(401).send({Error: "Unauthorized" });

                        }

                        var db_update_question_updateQuestion_end_time = Date.now();
                        client.timing('timing_db_update_question_updateQuestion', db_update_question_updateQuestion_end_time - db_update_question_updateQuestion_start_time );

                }
                else{

                    return res.status(401).send({Error: "Unauthorized" });

                }});

                logger.info('Update question process ended');
                var question_updateQuestion_end_time = Date.now();
                client.timing('timing_question_updateQuestion', question_updateQuestion_end_time - question_updateQuestion_start_time );
                client.timing('timing_db_update_question_updateQuestion', db_update_question_updateQuestion_end_time - db_update_question_updateQuestion_start_time );


};

///////////////////////////////////////////////////////////////////////
//Get a question's answer - Unauthenticated

exports.getAnswer = (req,res)=>{

    logger.info('Get a question\'s answer process started');
    client.increment('counter_question_getAnswer');
    var question_getAnswer_start_time = Date.now();

    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;



    //send 400 if params are empty
    if((!answer_id || !question_id)){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
            logger.warn('Bad Request');
            return;
    }



     //finding question by pkid
     Question.findByPk(question_id)
     .then(data=>{
         console.log(data);
         if(data.length != 0){

                    var db_findByPk_question_getAnswer_start_time = Date.now();
                     
                     //find answer by pkid
                     Answer.findByPk(answer_id,
                        {
                            include: [
                            {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}
                        ]
                        }
                        
                        )
                        .then(result=>{
                            if(result == null){
                                throw err;
                            }
                            result = JSON.stringify(result);
                            result = result.replace("files", "attachments");
                            result = JSON.parse(result);
                            // result = JSON.parse(JSON.stringify(result));
                            console.log(result);
                            return res.status(200).json(result)
                        })
                     .then(data=>{
                         console.log(data);
                         answer_ret = data.answer_text;
                         if(data.length != 0){
                             console.log("answer id found in question table")

                             
                             res.send(data);


                         }
                        else{
                            throw err;
                        }})
                     .catch(err=>{
                         res.status(404).send({
                             Error:"400 Not Found"
                         });
                     }); 

                     var db_findByPk_question_getAnswer_end_time = Date.now();

         }})
     .catch(err=>{
         res.status(404).send({
             Error:"404 Not Found"
             })});


             logger.info('Get a question\'s answer process ended');
             var question_getAnswer_end_time = Date.now();
             client.timing('timing_question_getAnswer', question_getAnswer_end_time - question_getAnswer_start_time );
             client.timing('timing_db_findByPk_question_getAnswer', db_findByPk_question_getAnswer_start_time - db_findByPk_question_getAnswer_end_time );
v




};


///////////////////////////////////////////////////////////////////////////
