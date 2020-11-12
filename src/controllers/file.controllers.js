const database = require("../models");
const Users = database.users;
const Category = database.categories;
const Answer = database.answers;
const Question = database.questions;
const File = database.files;
const Op = database.Sequelize.Op;
const bcrypt = require('bcrypt');
const Sequelize = require ("sequelize");
const { categories } = require("../models");
const { x } = require("joi");
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const AWS = require('aws-sdk');
const path = require("path") 
const S3_BUCKET = process.env.S3_BUCKET_NAME

//parses authorization header
function parseHeader(header){
    const base64Creds = header.split(' ')[1];
    console.log(base64Creds);
    const creds = Buffer.from(base64Creds, 'base64').toString('ascii');
    console.log(creds);
    return creds;
}

////////////////////////////////////////////////////////////////

//Attach a file to the question - Authenticated

exports.addFileToQuestion = async (req,res)=>{

    logger.info('Add file to question process started');
    client.increment('file_addFileToQuestion');



    const question_id = req.params.question_id;

    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        return;
    }

    //send 400 if body params or query params are empty
    // if((!req.body.answer_text || !req.params.question_id)){
    //     res.status(400).send(
    //         {
    //             Error: "400 Bad Request"
    //         });
    //         return;
    // }


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
  
      // console.log(req.headers.authorization);
      

      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data=>{
          console.log("data"+data);
        data_user_id = data.id;
          if(data.length != 0){
              bcrypt.compare(h_password, data.password, async function(err, result) {
                  console.log(result);
                  // console.log("err"+err);
                  if (result) {
                    //insert question post code here
                    // console.log(data.id);
                    // res.send(data);

                    console.log("user logged in");

                    console.log(req.files);
                    
                    // Set the region 
                    AWS.config.update({region: 'REGION'});

                    // Create S3 service object
                    s3 = new AWS.S3({
                        accessKeyId: '',
                        secretAccessKey: '',
                        region : 'us-east-1'});

                    // call S3 to retrieve upload file to specified bucket
                    var uploadParams = {Bucket:S3_BUCKET, Key: '', Body: ''};
                    var file = req.file;

                    // Configure the file stream and obtain the upload parameters
                    var fs = require('fs');

                    uploadParams.Body = file.buffer;
                    var path = require('path');
                    new_file_uuid = uuidv4();

                    s3_object_string = question_id + "/" + new_file_uuid + "/" + path.basename(file.originalname)
                    uploadParams.Key = s3_object_string;

                    //call S3 to retrieve upload file to specified bucket
                    s3.upload (uploadParams, async function (err, data) {
                    if (err) {
                        console.log("Error", err);
                    } if (data) {
                        console.log("Upload Success", data);

                        



                        let added_file_question = await File.create({
                            etag : data.ETag,
                            server_side_encryption : data.ServerSideEncryption,
                            location: data.Location,
                            file_name: path.basename(file.originalname),
                            s3_object_name: s3_object_string,
                            id: new_file_uuid,
                            questionId:req.params.question_id,
                            userId: data_user_id                  
                            }
                          );

                          


                          added_file_question1 = JSON.parse(JSON.stringify(added_file_question));
                          console.log("question");
                          console.log(added_file_question1)



                            File.findByPk(added_file_question1.id, {
                            //     include: [
                               
                            //     {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}
                            // ]
                            }).then(result =>{
                                console.log("result");
                                console.log(result);
                                result = JSON.parse(JSON.stringify(result));
                                delete result.etag;
                                delete result.userId;
                                delete result.location;
                                delete result.questionId;
                                delete result.server_side_encryption;
                                delete result. updatedAt;
                                delete result. answerId;
                                return res.status(201).send(result)
                            }).catch(err=>{
                                res.status(400).send({
                                    Error:"400 Bad Request"
                                });
                                return;
                            });




                        //   await Question.addFile(added_file_question);

                    }
                    });
                    

                    // var bucketParams = {
                    //     Bucket : 'webapp.jaisubash.devmane',
                    //   };
                      
                    //   // Call S3 to obtain a list of the objects in the bucket
                    //   s3.listObjects(bucketParams, function(err, data) {
                    //     if (err) {
                    //       console.log("Error", err);
                    //     } else {
                    //       //console.log("Success", data);
                    //     }
                    //   }.then());




                    // let user = await Users.findOne({
                    //     where: {
                    //         username:{
                    //             [Op.eq]: `${h_username}`
                    //         }
                    //     },
                    //     raw:true,
                    // });

                
                    // let answer = await Answer.create({
                    //     answer_text: req.body.answer_text,
                    //     userId: `${data.id}`,
                    //     questionId: `${question_id}`                   
                    //     }
                    //   )
                    // .then(data=>{
                    //     return data;
                    // })
                    // .then(data =>{
                    //     data = JSON.parse(JSON.stringify(data));
                    //     console.log(data);
                    //     res.status(201).send(data);
                    // })
                    // .catch(err=>{
                    //     res.status(400).send({
                    //         Error:"400 Bad Request"
                    //     });
                    //     return;
                    // });

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

                    // const ques = Question.findAll( {
                    //     include:Category,
                        
                    //         // include: [Answer],
                          
                    // })
                    // .then(data =>{
                    //     data = JSON.parse(JSON.stringify(data));
                    //     // delete data.password;
                    //     console.log((data));
                    //     // res.send(data);

                    // });
                    //console.log(ques);
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
      });

      logger.info('Add file to question process ended');
};



////////////////////////////////////////////////////////////////////////////////////

//Attach a file to the answer - Authenticated

exports.addFileToAnswer = async (req,res)=>{

    logger.info('Add file to answer process started');
    client.increment('file_addFileToAnswer');



    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "400 Bad Request" });
        return;
    }

    //send 400 if body params or query params are empty
    // if((!req.body.answer_text || !req.params.question_id)){
    //     res.status(400).send(
    //         {
    //             Error: "400 Bad Request"
    //         });
    //         return;
    // }


      creds = parseHeader(req.headers.authorization);

      const[h_username,h_password] = creds.split(':');
  
      // console.log(req.headers.authorization);
      

      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data=>{
        data = JSON.parse(JSON.stringify(data));
          console.log("data"+data);
       fetched_userid = data.id;
          if(data.length != 0){
              bcrypt.compare(h_password, data.password, async function(err, result) {
                  console.log(result);
                  // console.log("err"+err);
                  if (result) {
                    //insert question post code here
                    // console.log(data.id);
                    // res.send(data);

                    console.log("user logged in");

                    //console.log(req.files);
                    
                    // Set the region 
                    AWS.config.update({region: 'REGION'});

                    // Create S3 service object
                    s3 = new AWS.S3({
                        accessKeyId: '',
                        secretAccessKey: '',
                        region : 'us-east-1'});

                    // call S3 to retrieve upload file to specified bucket
                    var uploadParams = {Bucket:S3_BUCKET, Key: '', Body: ''};
                    var file = req.file;

                    // Configure the file stream and obtain the upload parameters
                    var fs = require('fs');

                    uploadParams.Body = file.buffer;
                    var path = require('path');

                    new_file_uuid = uuidv4();

                    s3_object_string = answer_id + "/" + new_file_uuid + "/" + path.basename(file.originalname)

                    uploadParams.Key = s3_object_string;

                    //call S3 to retrieve upload file to specified bucket
                    s3.upload (uploadParams, async function (err, data) {
                    if (err) {
                        console.log("Error", err);
                    } if (data) {
                        console.log("Upload Success", data);

                        



                        let added_file_answer = await File.create({
                            etag : data.ETag,
                            server_side_encryption : data.ServerSideEncryption,
                            location: data.Location,
                            file_name: path.basename(file.originalname),
                            s3_object_name: s3_object_string,
                            id: new_file_uuid,
                            questionId:req.params.question_id,
                            answerId: req.params.answer_id,
                            userId: fetched_userid

                            // categories:  catArray,                    
                            }
                            // ,{include: Category},
                          );


                          added_file_answer1 = JSON.parse(JSON.stringify(added_file_answer));
                          console.log("answer");
                          console.log(added_file_answer1)



                            File.findByPk(added_file_answer1.id, {
                            //     include: [
                               
                            //     {model: File, as: "files", attributes: ["id", "file_name", "s3_object_name", "createdAt"]}
                            // ]
                            }).then(result =>{
                                console.log("result");
                                console.log(result);
                                result = JSON.parse(JSON.stringify(result));
                                delete result.etag;
                                delete result.userId;
                                delete result.location;
                                delete result.questionId;
                                delete result.server_side_encryption;
                                delete result. updatedAt;
                                delete result. answerId;
                                return res.status(201).send(result)
                            }).catch(err=>{
                                res.status(400).send({
                                    Error:"400 Bad Request"
                                });
                                return;
                            });




                        

                        //   await Answer.addFile(added_file_answer);

                    }
                    });
                    

                    // var bucketParams = {
                    //     Bucket : 'webapp.jaisubash.devmane',
                    //   };
                      
                    //   // Call S3 to obtain a list of the objects in the bucket
                    //   s3.listObjects(bucketParams, function(err, data) {
                    //     if (err) {
                    //       console.log("Error", err);
                    //     } else {
                    //       //console.log("Success", data);
                    //     }
                    //   }.then());




                    // let user = await Users.findOne({
                    //     where: {
                    //         username:{
                    //             [Op.eq]: `${h_username}`
                    //         }
                    //     },
                    //     raw:true,
                    // });

                
                    // let answer = await Answer.create({
                    //     answer_text: req.body.answer_text,
                    //     userId: `${data.id}`,
                    //     questionId: `${question_id}`                   
                    //     }
                    //   )
                    // .then(data=>{
                    //     return data;
                    // })
                    // .then(data =>{
                    //     data = JSON.parse(JSON.stringify(data));
                    //     console.log(data);
                    //     res.status(201).send(data);
                    // })
                    // .catch(err=>{
                    //     res.status(400).send({
                    //         Error:"400 Bad Request"
                    //     });
                    //     return;
                    // });

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

                    // const ques = Question.findAll( {
                    //     include:Category,
                        
                    //         // include: [Answer],
                          
                    // })
                    // .then(data =>{
                    //     data = JSON.parse(JSON.stringify(data));
                    //     // delete data.password;
                    //     console.log((data));
                    //     // res.send(data);

                    // });
                    //console.log(ques);
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
      });

      logger.info('Add file to answer process ended');
};




//////////////////////////////////////////////////////////////////////


//Delete a file from question - Authenticated
exports.deleteFileFromQuestion = (req,res)=>{

    logger.info('Delete file from question process started');
    client.increment('file_deleteFileFromQuestion');

    const question_id = req.params.question_id;
    const file_id = req.params.file_id;


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(404).send({ Error: "404 Not Found" });
        return;
    }

    //send 400 if params are empty
    if((!file_id || !question_id)){
        res.status(404).send(
            {
                Error: "404 Not Found"
            });
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

      
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data => {
        const currentUser_userId = data.id;
        console.log("loginuser :"+currentUser_userId);
          if(data.length != 0){
            bcrypt.compare(h_password, data.password, function(err, result) {

                if(result){

                    //finding question by pkid
                    Question.findByPk(question_id, {
                        include: [
                        {model: Category, as: "categories", attributes: ["id", "category"], through: {attributes: []}},
                        {model: Answer, as: "answers", attributes: ["id", "userId", "questionId", "createdAt", "updatedAt", "answer_text"]}
                    ]
                    })
                    .then(result=>{
                        console.log(result);
                        if(result.length != 0){





                            result = JSON.parse(JSON.stringify(result));
                            console.log(result);

                            const questionAuthor_userId = result.user_id; 
                            console.log("questionuser :"+questionAuthor_userId);

                            ansVerify = result.answers.length;
                            console.log("ansVerify"+ansVerify);

                            //checking if question has one or more answers, if it does, cannot be deleted
                            if(ansVerify == 0){
                                //delete question


                                //checking whether user who posted question is same one who is trying to delete
                                if(currentUser_userId == questionAuthor_userId){
                                    console.log("user match.you can delete answer.")
                                    
                                    
                                    //perform operations



                                                //finding file by pkid
                                                File.findByPk(file_id)
                                                .then(data=>{
                                                    data = JSON.parse(JSON.stringify(data));
                                                    const file_key = data.s3_object_name;
                                                    console.log("filekey" + file_key);

                                                    console.log(data);
                                                    if(data.length != 0){

                                                        var params = {
                                                            Bucket: S3_BUCKET, 
                                                            Key: file_key
                                                            };
                                                        console.log(params);

                                                            s3.deleteObject(params, function(err, data) {
                                                                if (err) console.log(err, err.stack); // an error occurred
                                                                else     console.log(data);           // successful response
                                                                /*
                                                                data = {
                                                                }
                                                                */
                                                            });




                                                            // //deleting file
                                                            File.destroy({
                                                                where: {
                                                                    id: file_id
                                                                }
                                                                    })
                                                            .then(data=>{

                                                                //delete from aws s3 bucket, same object



                                                                

                                                                return data;

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
                                                    }})
                                                .catch(err=>{
                                                        res.status(404).send({
                                                            Error:"404 Not Found"
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



                                    
                                    

                        }})
                    .catch(err=>{
                        res.status(404).send({
                            Error:"404 Not Found"
                            })});
                    

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
      });

      logger.info('Delete file from question process ended');
};








////////////////////////////////////////


//  //finding file by pkid
//  File.findByPk(file_id)
//  .then(data=>{
//      file_key = data.key;
//      console.log("filekey" + file_key );

//      console.log(data);
//      if(data.length != 0){




//              // // //deleting file
//              // File.destroy({
//              //     where: {
//              //         id: file_id
//              //     }
//              //         })
//              // .then(data=>{

//              //     //delete from aws s3 bucket, same object



//              //     var params = {
//              //         Bucket: "webapp.jaisubash.devmane", 
//              //         Key: "objectkey.jpg"
//              //         };

//              //         s3.deleteObject(params, function(err, data) {
//              //             if (err) console.log(err, err.stack); // an error occurred
//              //             else     console.log(data);           // successful response
//              //             /*
//              //             data = {
//              //             }
//              //             */
//              //         });

//              // })
//              // .then(data=> {

//              //     res.status(204).send({
//              //         Message:"No Content"
//              //     });
                 
                 
//              // })
//              // .catch(err=>{
//              //     res.status(404).send({
//              //         Error:"404 Not Found"
//              //     });
//              // }); 



//      }
//      else{
//          throw err;
//      }})
//  .catch(err=>{
//          res.status(404).send({
//              Error:"404 Not Found"
//          });
//  }); 


///////////////////////////////////////




//Delete a file from Answer - Authenticated
exports.deleteFileFromAnswer = (req,res)=>{

    logger.info('Delete file from answer process started');
    client.increment('file_deleteFileFromAnswer');

    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;
    const file_id = req.params.file_id;


    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(404).send({ Error: "404 Not Found" });
        return;
    }

    //send 400 if params are empty
    if((!answer_id || !question_id)){
        res.status(404).send(
            {
                Error: "404 Not Found"
            });
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

      
      Users.findOne({
          where: {
              username:{
                  [Op.eq]: `${h_username}`
              }
          },
          raw:true,
      })
      .then(data => {
        const currentUser_userId = data.id;
        console.log("loginuser :"+currentUser_userId);
          if(data.length != 0){
            bcrypt.compare(h_password, data.password, function(err, result) {

                if(result){

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



                                                //finding file by pkid
                                                File.findByPk(file_id)
                                                .then(data=>{
                                                    data = JSON.parse(JSON.stringify(data));
                                                    const file_key = data.s3_object_name;
                                                    console.log("filekey" + file_key);

                                                    console.log(data);
                                                    if(data.length != 0){

                                                            var params = {
                                                            Bucket: S3_BUCKET, 
                                                            Key: file_key
                                                            };
                                                            console.log(params);

                                                            s3.deleteObject(params, function(err, data) {
                                                                if (err) console.log(err, err.stack); // an error occurred
                                                                else     console.log(data);           // successful response
                                                                /*
                                                                data = {
                                                                }
                                                                */
                                                            });




                                                            // //deleting file
                                                            File.destroy({
                                                                where: {
                                                                    id: file_id
                                                                }
                                                                    })
                                                            .then(data=>{

                                                                //delete from aws s3 bucket, same object

                                                                return data;

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
                                                                }})
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
      });

      logger.info('Delete file from answer process ended');
};





//////////////////////////////////////////////////////

//for answer














