const express = require('express');
const mongoose = require('mongoose');
const Message = require('./models/Message')

class _dbService {
    constructor(){
        this.DBURL = 'mongodb://mongodb:27017/messages'  
    }

    connect() {
        mongoose.connect('mongodb://mongodb:27017/messages', { useNewUrlParser: true })
        .then(x => {
            console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
        })
        .catch(err => {
            console.error("Error connecting to mongo", err);
        });

    }

    create(destination, body){
       return Message.create({destination: destination, body: body}).then(message => {
            console.log(message);   
        }).catch(err => console.log(err))
       //return;
    }


}


const dbService = new _dbService();
module.exports = dbService;