var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
var $ = require("cheerio");
const app = express();
const apis = require("./apikeys");
app.use(bodyParser.json());

app.get("/api/getruntime",async function(req,res){
    var url = req.query.url;
    var playlistId = url.split("=")[1];
    var response = await axios.get(url);
    var data = response.data;
    var title = $($("h1 a",data).toArray()[0]).text();
    var img = $("td img[data-thumb]",data).toArray()[0].attribs["data-thumb"];
    //"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=PLBCF2DAC6FFB574DE&key=[YOUR_API_KEY]
    var videoIds = []
    response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apis[0]}`);
    var totalResults = response.data["pageInfo"]["totalResults"]
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
    var time = convertTime(timeArray)
    var toSend = {title: title,img: img,time:time,totalResults:totalResults}
    res.send(toSend);
})
function convertTime(x){

    var y = x.map(function(element){
        element= element.replace("P","");
        element = element.replace("T","");
        return element;
    })
    var totalSeconds = 0
    y.forEach(element=>{
        var days = element.split("D");
        var x;
        
        if(days.length == 2){
            totalSeconds+=parseInt(days[0],10)*3600*24;
            x = days[1]
        }
        else{
            x = days[0];
        }
        var hours = x.split("H");
        if(hours.length == 2){
            totalSeconds+=parseInt(hours[0],10)*3600;
            x = hours[1];
        }
        else{
            x = hours[0]
        }
        var minutes = x.split("M");
        if(minutes.length == 2){
            totalSeconds+=parseInt(minutes[0],10)*60;
            x = minutes[1];
        }
        else{
            x = minutes[0]
        }
        var seconds = x.split("S");
        if(seconds.length == 2){
            totalSeconds+=parseInt(seconds[0],10);
            x = seconds[1];
        }
        else{
            x = seconds[0]
        }
        
    })
    var hours   = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
    
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours+':'+minutes+':'+seconds);
}

app.listen(process.env.PORT||4000,function(){console.log("listening");})