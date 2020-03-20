var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var $ = require("cheerio");
const app = express();
app.use(bodyParser.json());

app.get("/api/getruntime",async function(req,res){
    
    res.send("hello");
})

app.listen(process.env.PORT||4000,function(){console.log("listening");})