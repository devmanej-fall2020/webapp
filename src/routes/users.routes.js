module.exports = app => {

    const users = require("../controllers/users.controllers.js");
    var router = require("express").Router();

    router.post("/user", users.create)

    router.put("/user/self", users.update);

    router.get("/user/self", users.findUser)

    app.use('/v1/',router)
};