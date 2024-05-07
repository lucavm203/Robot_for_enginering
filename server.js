let fs = require('fs');
const MongoDB = require("mongodb");

const express = require('express');
const axios = require('axios');
require('dotenv').config()

const app = express();
const path = require('path');
const port = 8000;
let server = require('http').createServer();
var WebSocketServer = require('ws');
const { time } = require('console');
const { Date } = require('core-js');
const ws = new WebSocketServer('ws://145.49.113.123:1880/ws/test');
const uri = "mongodb+srv://"+process.env.USER_NAME+":"+process.env.USER_PASSWORD+"@cluster0.aczs2un.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const http = axios.create({
  baseURL: 'http://145.49.113.123:1880'
});

app.use(
  express.urlencoded({
    extended: true,
  })
)


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

const client = new MongoDB.MongoClient(uri);

async function insertws(data) {
  try {
    const database = client.db('Test');
    const movies = database.collection('tester');
    // Query for a movie that has the title 'Back to the Future'
  
    // const string = timest.toString()
    const doc = {
      time: data
    }
    const result = await movies.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

  } finally {
    // Ensures that the client will close when you finish/error
  }
}

ws.on('error', console.error);

ws.on('message', function message(data) {
  console.log('received: %s', data);
  console.dir(data)
  const resultStr = data.toString();
  console.dir(resultStr)
  const timestamp = new Date();
  const iso = timestamp.toISOString()

  insertws(iso).catch(console.dir)
});





app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
  });

app.post("/post", async (req,res)=>
{
  const tijd = await req.body.tijd
  const voor = await req.body.voor
  const achter = await req.body.achter
  const links = await req.body.left
  const rechts = await req.body.right
  const stop = await req.body.stop
  const start = await req.body.start
  console.log(tijd)
  console.log(voor)
  console.log(achter)
  console.log(links)
  console.log(rechts)
  console.log("niks")
  console.log(stop)
  if(stop != undefined){
    return http.get('/test', {
      params: {
        richting: stop
      }});
  }else if(start != undefined){
    return http.get('/test', {
      params: {
        richting: start
      }});
  }
  else if(voor != undefined){
    return http.get('/test', {
      params: {
        richting: voor,
        time: tijd
      }});
  }
  else if(achter != undefined){
    return http.get('/test', {
      params: {
        richting: achter,
        time: tijd
      }});
  }
  else if(links != undefined){
    return http.get('/test', {
      params: {
        richting: links,
        time: tijd
      }});
  }
  else if(rechts != undefined){
    return http.get('/test', {
      params: {
        richting: rechts,
        time: tijd
      }});
  }

})


app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
    console.log(`the URL is http://localhost:${port}`)
});
function cleanup() {
  // do clean up here
  client.close
  console.log("good bye. till next time")
}

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});