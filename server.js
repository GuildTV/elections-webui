"use strict";
const express = require("express");
const bodyParser = require("body-parser");

import { webui_port } from "./config";

import { setup as positionSetup } from "./controllers/position";
import { setup as peopleSetup } from "./controllers/person";
import { bind as cvizBind, setup as cvizSetup } from "./controllers/cviz";
import { setup as graphSetup } from "./controllers/graphs";
import { setup as tickerSetup } from "./controllers/ticker";

import Models from "./models";

const app = express();

// Run server to listen on port 3000.
const server = app.listen(webui_port, "0.0.0.0", () => {
  console.log(`listening on *:${webui_port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("public"));

const io = require("socket.io")(server);

graphSetup(Models, app);
positionSetup(Models, app);
peopleSetup(Models, app, io);
cvizSetup(Models, app);
tickerSetup(Models, app);

io.on("connection", function (client) {
  console.log(
    "New connection from " +
      client.handshake.address +
      ":" +
      client.handshake.port
  );

  cvizBind(Models, client, io);

  client.on("disconnect", function () {
    console.log("Lost client");
  });
});
