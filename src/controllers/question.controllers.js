const database = require("../models");
//const Question = database.questions;
//const Answer = database.answers;
//const Users = database.users;

//const database = require("../models");
const Users = database.users;
const Category = database.categories;
const Answer = database.answers;
const Question = database.questions;
const Op = database.Sequelize.Op;
const bcrypt = require('bcrypt');
const saltRounds = 10;

////////////////////////////////////////////////////////////////
//Creates question with authenticated user endpoint
exports.createQuestion = (req,res)=>{

  //check if credential headers are not present
  if (!req.headers.authorization) {
      res.status(400).send({ Error: "400 Bad Request" });
      return;
  }

  //send 400 if body params are empty
  if((!req.body.question_text || !req.body.categories )){
      res.status(400).send(
          {
              Error: "400 Bad Request"
          });
          return;
  }

  const questions = {
      question_text: req.body.question_text,
      categories: req.body.categories[0].category.split(','),
  }

  //parses authorization header
  function parseHeader(header){
  const base64Creds = header.split(' ')[1];
  console.log(base64Creds);
  const creds = Buffer.from(base64Creds, 'base64').toString('ascii');
  console.log(creds);
  return creds;
}

  //traverse categories array and get values from it
  // for (i in categories.category) {
  //     x += categories.category[i];
  //     console.log(i);
  //   }


  //traversing the categories array
  console.log(req.body.categories[0].category.split(','));



        
  
  



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
        console.log(data);
        data_user_id = data.id;
        if(data.length != 0){
            bcrypt.compare(h_password, data.password, function(err, result) {
                console.log(result);
                // console.log("err"+err);
                if (result) {
                  //insert question post code here




                  Question.create({
                      question_text: req.body.question_text,
                      categories:  req.body.categories[0].category.split(','),
                      user_id: data_user_id
                          
                      }, {
                      include: [Category],
                      

                    })
                  .then(data=>{
                      return data;
                  })
                  .then(data =>{
                      data = JSON.parse(JSON.stringify(data));
                      console.log(data);
                      res.status(201).send(data);
                  })
                  .catch(Sequelize.ValidationError, function (err) {
                    // respond with validation errors
                    return res.status(422).send(err.errors);
                })
                  .catch(err=>{
                      res.status(400).send({
                          Error:"400 Bad Request"
                      });
                      return;
                  });

                  // const testQuestion = Question.create({
                  //     question_text: "test question"
                  // });

                  // const testCategory = Category.create({
                  //     category: "test category"
                  // });

                  // testQuestion.Category(testCategory);

                  // const ques = Question.findAll( {
                  //     include:[Category]
                  // })
                  // .then(data =>{
                  //     data = JSON.parse(JSON.stringify(data));
                  //     // delete data.password;
                  //     console.log((data));
                  //     // res.send(data);

                  //     // data.forEach(cat =>{
                  //     //     console.log(cat.categories);
                  //     // })
                  //     // console.log(data);
                  // });



                  // console.log(ques);



                 







                  
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
};