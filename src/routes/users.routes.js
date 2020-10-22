module.exports = app => {

    const users = require("../controllers/users.controllers.js");
    const questions = require("../controllers/question.controllers.js");
    const files = require("../controllers/file.controllers.js");
    var router = require("express").Router();
    var multer  = require('multer')
    var upload = multer()

    //user routes
    router.post("/user", users.create);

    router.put("/user/self", users.update);

    router.get("/user/self", users.findUser);

    router.get("/user/:id", users.findUserById);

    //question routes

    router.post("/question", users.createQuestion);

    router.get("/questions", users.findAllQuestions);

    router.get("/question/:question_id", users.findQuestionById);

    //answer routes

    router.post("/question/:question_id/answer", users.answerQuestion);

    router.put("/question/:question_id/answer/:answer_id", users.updateAnswer);

    router.delete("/question/:question_id/answer/:answer_id", users.deleteAnswer);

    router.delete("/question/:question_id", users.deleteQuestion);

    router.put("/question/:question_id", users.updateQuestion);

    router.get("/question/:question_id/answer/:answer_id", users.getAnswer);


    //file routes

    router.post("/question/:question_id/file",upload.single('file'), files.addFileToQuestion);

    router.post("/question/:question_id/answer/:answer_id/file",upload.single('file'), files.addFileToAnswer);

    router.delete("/question/:question_id/file/:file_id", files.deleteFileFromQuestion);

    router.delete("/question/:question_id/answer/:answer_id/file/:file_id", files.deleteFileFromAnswer);







    app.use('/v1/',router);
};