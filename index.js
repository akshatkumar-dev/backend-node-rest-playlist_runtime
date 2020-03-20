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
    res.send(videoIds);
})

app.listen(process.env.PORT||4000,function(){console.log("listening");})