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
// const ws = new WebSocketServer('ws://145.49.113.123:1880/ws/test');
const uri = "mongodb+srv://"+process.env.USER_NAME+":"+process.env.USER_PASSWORD+"@cluster0.aczs2un.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
var startstop = 'stop';

const http = axios.create({
  baseURL: 'http://145.49.127.249:1880/aaadlander',
  headers: {
    'Content-Type' : 'application/x-www-form-urlencoded'
  }
});

app.use(
  express.urlencoded({
    extended: true,
  }),
  express.json()
)


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

const client = new MongoDB.MongoClient(uri);
// async function insertws(data) {
//   try {
//     const database = client.db('Test');
//     const movies = database.collection('tester');
//     // Query for a movie that has the title 'Back to the Future'
  
//     // const string = timest.toString()
//     const doc = {
//       time: data
//     }
//     const result = await movies.insertOne(doc);
//     console.log(`A document was inserted with the _id: ${result.insertedId}`);

//   } finally {
//     // Ensures that the client will close when you finish/error
//   }
// }

// ws.on('error', console.error);

// ws.on('message', function message(data) {
//   console.log('received: %s', data);
//   console.dir(data)
//   const jsonobj = JSON.parse(data)
//   let x = jsonobj.XYZ.X
//   let y = jsonobj.XYZ.Y
//   let z = jsonobj.XYZ.Z
//   console.log(x)
//   console.log(y)
//   console.log(z)
//   // const resultStr = data.toString();
//   // console.dir(resultStr)
//   // const timestamp = new  Date();
//   // const iso = timestamp.toISOString()

//   // insertws(iso).catch(console.dir)
// });





app.get("/", (req, res) => {
    res.render("index", { title: "controll", startstop: startstop});
  });
app.get("/data", (req,res) => {
  res.render("data",{title: "data"})
});



app.post("/post", async (req,res)=> 
{
  const tijd = await req.body.tijd
  const vooruit = await req.body.vooruit
  const achteruit = await req.body.achteruit
  const links = await req.body.links
  const rechts = await req.body.rechts
  const stop = await req.body.stop
  const start = await req.body.start
  const linksrijdend = await req.body.linksrijdend
  const rechtsrijdend = await req.body.rechtsrijdend
  console.log(tijd)
  console.log(vooruit)
  console.log(achteruit)
  console.log(links)
  console.log(rechts)
  console.log(stop)
  console.log(start)
  console.log(linksrijdend)
  console.log(rechtsrijdend)
  res.send("200");
  if(stop != undefined){
    startstop = "start"
    return http.post('/aaad1', {
        commando: stop,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }else if(start != undefined){
    startstop = "stop"
    return http.post('/aaad1', {
        commando: start,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  else if(vooruit != undefined){
    return http.post('/aaad1', {
        commando: vooruit,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  else if(achteruit != undefined){
    return http.post('/aaad1 ', {
        commando: achteruit,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  else if(links != undefined){
    return http.post('/aaad1', {
        commando: links,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  else if(rechts != undefined){
    return http.post('/aaad1',{
        commando: rechts,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  else if(linksrijdend != undefined){
    return http.post('/aaad1', {
        commando: linksrijdend,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  else if(rechtsrijdend != undefined){
    return http.post('/aaad1', {
        commando: rechtsrijdend,
        tijd: tijd
      })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
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