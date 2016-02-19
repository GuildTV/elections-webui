"use strict";
const express = require('express');
const bodyParser = require('body-parser');

import { webui_port } from "./config"

import Person from "./models"

const app = express();

// Run server to listen on port 3000.
const server = app.listen(webui_port, () => {
  console.log(`listening on *:${webui_port}`);
});

const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false } ));
app.use(express.static('static'));

// Set socket.io listeners.
io.sockets.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('newPerson', (data) => {
    console.log("New Person: " + JSON.stringify(data));

    if (data.type == "candidate") {
      data.candidate = true
    } else {
      data.candidate = false
    }

    let person = new Person(data);

    person.save(function(error, doc) {
        if (error) {
            console.log("Error saving new person: " + JSON.stringify(error))
        }
        else {
            console.log("Person added to DB: "+ JSON.stringify(doc))
        }
    });

  });

  socket.on('getPeople', () => {
    Person.run().then(function(data) {
      socket.emit('getPeople', JSON.stringify(data));
    }).error(function(error) {
      console.log("Error getting people: " + JSON.stringify(error))
    });
  });


});

// Set Express routes.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/edit/people', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
