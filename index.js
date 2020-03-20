var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var $ = require("cheerio");
const app = express();
const apis = require("./apikeys");
app.use(bodyParser.json());

app.get("/api/getruntime",async function(req,res){
    var playlistId = req.query.url.split("=")[1];
    //"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=PLBCF2DAC6FFB574DE&key=[YOUR_API_KEY]
    var videoIds = []
    var response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apis[0]}`);
    while(true){
        var items = response.data["items"];
        items.forEach(element => {
            videoIds.push(element["contentDetails"]["videoId"])
        });
        if(response.data.hasOwnProperty("nextPageToken")){
            var pageToken = response.data["nextPageToken"];
            response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&pageToken=${pageToken}&playlistId=${playlistId}&key=${apis[0]}`)
        }
        else{
            break;
        }
    }
    var timeArray = [];
    if(videoIds.length < 50){
        var ids = ""
        ids+=videoIds[0];
        for(var i = 1;i<videoIds.length;i++){
            ids+="%2C"+videoIds[i];
        }
        response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&maxResults=50&key=${apis[0]}`)
        var items = response.data["items"];
                items.forEach(element=>{
                    timeArray.push(element["contentDetails"]["duration"])
                });
    }
    else{
        try{
        var current = 0;
        var rounds = Math.floor(videoIds.length/49);
        var remaining = videoIds.length%49;
        for(var i = 0;i<rounds;i++){
            var ids = "";
                ids+=videoIds[current];
                current++;
                for(var j = 0;j<49;j++){
                    ids+="%2C"+videoIds[current];
                    current++;
                }
                response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&maxResults=50&key=${apis[0]}`);
                var items = response.data["items"];
                items.forEach(element=>{
                    timeArray.push(element["contentDetails"]["duration"])
                });
            }
            var ids = "";
            for(var i = 0;i<remaining;i++){
                ids+=videoIds[current]+"%2C";
                current++;
            }
            response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&maxResults=50&key=${apis[0]}`);
                var items = response.data["items"];
                items.forEach(element=>{
                    timeArray.push(element["contentDetails"]["duration"])
                });
        
            }
            catch(err){
                console.log(err)
            }
    }
    
    res.send(timeArray);
})

app.listen(process.env.PORT||4000,function(){console.log("listening");})