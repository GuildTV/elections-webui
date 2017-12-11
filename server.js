"use strict";
const express = require('express');
const bodyParser = require('body-parser');

import { webui_port } from "./config";

import { setup as positionSetup } from './controllers/position';
import { setup as peopleSetup } from './controllers/person';
import { setup as cvizSetup, bind as cvizBind } from './controllers/cviz';
import { setup as graphSetup } from './controllers/graphs';

import Models from "./models";

const app = express();

// Run server to listen on port 3000.
const server = app.listen(webui_port, () => {
  console.log(`listening on *:${webui_port}`);
});

const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false } ));
app.use(bodyParser.json({ limit: '10mb'}));
app.use(express.static('public'));

graphSetup(Models, app);
positionSetup(Models, app);
peopleSetup(Models, app);
cvizSetup(Models, app);

// Set socket.io listeners.
io.sockets.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  cvizBind(Models, socket);
});
