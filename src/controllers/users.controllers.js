const database = require("../models");
const Users = database.users;
const Op = database.Sequelize.Op;
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Creates user using body parameters
exports.create = (req,res)=>{

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
                return;
    }


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
        // console.log("userdatacheck"+ data);
        // console.log(JSON.stringify(data));
        if(data.length != 0){
            res.status(400).send({
                Error:"400 Bad Request"
            });
            return;
            
        }
        else{

            Users.create(users)
        .then(data=>{
            return data;
        })
        .then(data =>{
            data = JSON.parse(JSON.stringify(data));
            delete data.password;
            console.log((data));
            res.send(data);
        })
        .catch(err=>{
            res.status(400).send({
                Error:"400 Bad Request"
            });
            return;
        });
        }
    })
    .catch(err=>{
        res.status(400).send({
            Error:"400 Bad Request"
        });
        return;
    });
    



    const users = {
            first_name: req.body.first_name,
          last_name: req.body.last_name,
          password: req.body.password,
            username:req.body.username,
    }

};

//parses authorization header
function parseHeader(header){
    const base64Creds = header.split(' ')[1];
    console.log(base64Creds);
    const creds = Buffer.from(base64Creds, 'base64').toString('ascii');
    console.log(creds);
    return creds;
}


//Gets user info from database
exports.findUser = (req,res) =>{

    if (!req.headers.authorization) {
        res.status(403).send({ Error: 'No credentials sent!' });
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
        }
      }
    
    Users.findOne({
        where: {
            username:{
                [Op.eq]: `${username}`
            }
        },
        raw:true,
    })
    .then(data=>{
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
    });

};

//Updates User
exports.update = (req,res)=>{

    //check if credential headers are not present
    if (!req.headers.authorization) {
        res.status(400).send({ Error: "402 Bad Request" });
        return;
    }

    //send 400 if body params are empty
    if((!req.body.password || !req.body.first_name || !req.body.last_name  )){
        res.status(400).send(
            {
                Error: "403 Bad Request"
            });
            return;
    }

    //attempt to update email, createdon, updatedon, send 400
    if((req.body.username || req.body.account_created || req.body.account_updated  )){
        res.status(400).send(
            {
                Error: "400 Bad Request"
            });
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
      .then(data=>{
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

                            

                            Users.update({
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                password:req.body.password,
                                }, { where: { 
                                first_name: `${data.first_name}`,
                                last_name:`${data.last_name}`,
                                password:`${data.password}`,
                            }})
                            .then(() => {return Users.findOne({
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
};
