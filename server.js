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
const ws = new WebSocketServer('ws://145.49.127.249:1880/ws/aaad1');
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
async function insertHelling(x_helling,y_helling,z_helling,time) {
  try {
    const database = client.db('Aadlander');
    const Helling = database.collection('TestHellingshoek');
    // Query for a movie that has the title 'Back t o the Future'
  
    // const string = timest.toString()
    const doc = {
      X_helling: x_helling,
      Y_helling: y_helling,
      Z_helling: z_helling,
      Timestamp: time
    }
    const result = await Helling.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

  } finally {
    // Ensures that the client will close when you finish/error
  }
}
async function insertLocatie(x_locatie,y_locatie,time) {
  try {
    const database = client.db('Aadlander');
    const Locatie = database.collection('TestLocatie');
    // Query for a movie that has the title 'Back to the Future'
  
    // const string = timest.toString()
    const doc = {
      Latitude: x_locatie,
      Longitude: y_locatie,
      Timestamp: time
    }
    const result = await Locatie.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

  } finally {
    // Ensures that the client will close when you finish/error
  }
}
async function insertCommando(commando,rijtijd,time) {
  try {
    const database = client.db('Aadlander');
    const Commando = database.collection('TestCommandos');
    // Query for a movie that has the title 'Back to the Future'
  
    // const string = timest.toString()
    const doc = {
      Commando: commando,
      Rijtijd: rijtijd,
      Timestamp: time
    }
    const result = await Commando.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

  } finally {
    // Ensures that the client will close when you finish/error
  }
}

ws.on('error', console.error);

ws.on('message', function message(data) {
  console.log('received: %s', data);
  console.dir(data)
  const jsonobj = JSON.parse(data)
  let x_helling = jsonobj.xas_helling;
  let y_helling = jsonobj.yas_helling;
  let z_helling = jsonobj.zas_helling;
  let x_locatie = jsonobj.xas_locatie;
  let y_locatie = jsonobj.yas_locatie;
  let timestamp = jsonobj.timestamp;
  console.log(x_helling);
  console.log(y_helling);
  console.log(z_helling);
  console.log(x_locatie);
  console.log(y_locatie);
  insertHelling(x_helling,y_helling,z_helling,timestamp).catch(console.dir);
  insertLocatie(x_locatie,y_locatie,timestamp).catch(console.dir);

});




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
  let Timestamp = new Date();
  console.log(Timestamp);
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
        insertCommando(stop,tijd,Timestamp).catch(console.dir);
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
        insertCommando(start,tijd,Timestamp).catch(console.dir);
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
        insertCommando(vooruit,tijd,Timestamp).catch(console.dir);
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
        insertCommando(achteruit,tijd,Timestamp).catch(console.dir);
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
        insertCommando(links,tijd,Timestamp).catch(console.dir);
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
        insertCommando(rechts,tijd,Timestamp).catch(console.dir);
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
        insertCommando(linksrijdend,tijd,Timestamp).catch(console.dir);
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
        insertCommando(rechtsrijdend,tijd,Timestamp).catch(console.dir);
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