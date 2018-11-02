require('dotenv').config();
var express = require('express');
const bodyParser = require('body-parser');
var axios = require('axios')
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const dbService = require('./dbService/dbService');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(dbService.connect())
app.use((err, req, res, next) =>{  
  if (err instanceof SyntaxError) {
    res.status(400).json({status: "INVALID JSON FORMAT"})
  } else if (err) {
    res.status(500).json({status: "SERVER ERROR"})  
  } else {
    next();
  }
})
setTimeout(dbService.connect, 4000)

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min window
  max: 100, // 100 requests per window
  message:
    ({status: "Too many requests from this IP, please try again after a minute"})
});

const validation = () => {
  return (req, res, next) => {

    if (!req.body.destination) {
      console.log("destination key required to send a message")
      res.status(400).json({status: "Destination key required to send a message"})
      return;
    }
    else if (!req.body.body) {
      console.log("body key required to send a message")
      res.status(400).json({status: "body key required to send a message"})
      return;
    }

    let {destination, body} = req.body;

    if (typeof req.body !== "object"){
      res.status(400). json({status: "OBJECT EXPECTED BY SERVICE"})
      return;
    }
    else if(destination === undefined) {
      console.log("Message can't be sent to undefined")
      res.status(400).json({status: "Message can't be sent to undefined"})
      return
    }
    else if(body === undefined) {
      console.log("Message body can't be undefined")
      res.status(400).json({status: "Message body can't be undefined"})
      return
    }
    else if(!destination || !body) {
      console.log("body or destination not provided")
      res.status(400).json({status: "body or destination not provided"})
      return;
    }
    else if (typeof destination !== "string" || typeof body !== "string"){
      console.log("incorrect type of parameters")
      res.status(400).json({status: "body and destination must be strings"})
      return;
    }
    else if (destination.length == 0 || body.length == 0) {
      console.log("fields must be filled")
      res.status(400).json({status: "all fields must be filled"})
      return;
    }
    else if (destination.length > 100) {
      console.log("Destination field exceeded max length")
      res.status(400).json({status: "destination length excedeed"})
      return;
    }
    else if (body.length > 200) {
      console.log("Body field exceeded max length")
      res.status(400).json({status: "body length exceeded"})
      return;
    }
    next()
  }
}

app.get('/messages', apiLimiter, (req, res, next) => {
  dbService.getAll().then(messages => {
    res.status(200).json({data: messages})
    console.log("MESSAGES READED", messages)

  }).catch(err => console.log(err))
})


app.post('/message', apiLimiter, validation(), (req, res, next) => {

  
  let {destination, body} = req.body

  axios.post('http://messageapp:3000/message', {destination, body})
  .then(response => {
    console.log("POST succeeded: ", response.data);
    dbService.create(destination, body)
      .then(message =>{

        console.log("Message stored:", message)
        res.status(200).json({
          status: "200",
          data: response.data
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({status: "INTERNAL SERVER ERROR: DATABASE ERROR"})
      })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({status: "INTERNAL SERVER ERROR: EXTERNAL SERVICE DIDN'T RESPONSE"})
  })

})

app.listen(9001, function () {
  console.log('Server listening on port 9001');
});