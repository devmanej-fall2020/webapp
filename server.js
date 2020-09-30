const express = require ("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const database = require("./src/models")

let app = express();
PORT = 4000;


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.get("/",(req,res) => {
    res.json({message: `Node and Express server running on port ${PORT}`});
});

require("./src/routes/users.routes")(app);

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;




// database.sequelize.sync({force:true}).then(()=>{
//     console.log("Sync Database");
// });
