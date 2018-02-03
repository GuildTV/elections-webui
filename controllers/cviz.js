const net = require('net');
const uuidv4 = require('uuid/v4');

const cvizSlot = "default";

let lastState = {};

let pingInterval = null;

let adjustmentList = [];
let templateName = null;

function isRunningTemplate(name){
  if (!lastState || !lastState.timelineFile)
    return false;

  return lastState.timelineFile == name;
}
function isRunningAnything(){
  if (!lastState || !lastState.state)
    return false;

  return lastState.state.toLowerCase() != "clear";
}

function buildClientState(){
  if (!lastState || !lastState.state)
    return lastState;

  if (lastState.timelineFile != templateName && lastState.state.toLowerCase() != "clear"){
    adjustmentList = [];
    templateName = lastState.timelineFile;
  }

  if (lastState.state.toLowerCase() == "cueorchild"){
    if (adjustmentList.length > 0)
      return Object.assign({}, lastState, {
        state: "cue",
        stateMessage: "Load adjustment: " + adjustmentList[0].key,
      });
    else
      return Object.assign({}, lastState, {
        state: "cue",
      });
  }

  return lastState;
}

import { cvizHost, cvizPort } from '../config';

import { generateRon } from './ron';

const client = new net.Socket();
client.setNoDelay(true);
client.setTimeout(500);

client.on('error', () => {
  console.log("lost connection to cviz");

  client.destroy();
  client.unref();
  client.connect(cvizPort, cvizHost, () => {
    console.log("reconnected");
  });
});

client.connect(cvizPort, cvizHost, function() {
  console.log('Connected to cviz');

  pingInterval = setInterval(() => {
    client.write("{}\n");
  }, 300);
});

client.on('data', (data) => {
  try {
    if(data == "{}")
      return;

    const blob = JSON.parse(data);
    if (blob.timelineSlot  != cvizSlot)
      return; // Not a slot we care about

    // console.log("New state", lastState);

    lastState = blob;
  } catch (e){
    // console.log("Error", e);
  }
});

client.on('close', () => {
  console.log("Server has gone away!");
  if(pingInterval != null){
    clearInterval(pingInterval);
    pingInterval = null;
  }
});

function getWinnersOfType(Models, type){
  let { Person, Position } = Models;

  return Position.findAll({
    where: {
      type: type
    },
    order: [[ "winnerOrder", "ASC" ]],
    include: [{
      model: Person,
      include: [ Position ],
      where: {
        elected: true
      },
      required: false
    }]
  }).then(positions => {
    return positions.map(v => {
      if (v.People && v.People[0])
        return v.People[0];

      return generateRon(v);
    });
  });
}

export function setup(Models, app){
  const { Person, Position } = Models;

  app.get('/api/cviz/status', (req, res) => {
    res.send({
      adjustments: adjustmentList,
      state: buildClientState(),
    });
  });

  app.delete('/api/cviz/adjustment/:id', (req, res) => {
    adjustmentList = adjustmentList.filter(a => a.id != req.params.id);

    res.send({
      adjustments: adjustmentList,
      state: buildClientState(),
    });
  });

  app.post('/api/cviz/adjustment/clear', (req, res) => {
    adjustmentList = [];

    res.send({
      adjustments: adjustmentList,
      state: buildClientState(),
    });
  });

  app.post('/api/cviz/adjustment/next/:id', (req, res) => {
    const entry = adjustmentList.find(a => a.id == req.params.id);
    if (!entry){
      res.status(500).send("Failed to find");
      return;
    }

    adjustmentList = adjustmentList.filter(a => a.id != req.params.id);
    adjustmentList.unshift(entry);

    res.send({
      adjustments: adjustmentList,
      state: buildClientState(),
    });
  });

  app.post('/api/cviz/cue', (req, res) => {
    console.log("templateGo");

    if ((lastState.state || "").toLowerCase() == "cueorchild" && adjustmentList.length > 0){
      const adjust = adjustmentList.shift();
      client.write(JSON.stringify({
        type: "RUNCHILD",
        parameters: adjust.parameters,
        instanceName: adjust.key,
      })+"\n");
      res.send("OK");

      return;
    }

    client.write(JSON.stringify({
      type: "CUE"
    })+"\n");
    res.send("OK");
  });

  app.post('/api/cviz/kill', (req, res) => {
    console.log("templateKill");

    templateName = null;

    client.write(JSON.stringify({
      type: "KILL"
    })+"\n");
    res.send("OK");
  });

  app.post('/api/run/person/:id/:template', (req, res) => {
    console.log("Run template for person", req.params);

    return Person.findById(req.params.id, {
      include: [ Position ]
    }).then(data => {
      let type = req.params.template;
      if (type.toLowerCase() == "sidebarphoto" || type.toLowerCase() == "sidebartext")
        type = "sidebar";

      if (!isRunningTemplate(type) && isRunningAnything())
        return res.send("RUNNING_OTHER");
      if (!isRunningTemplate(type))
        adjustmentList = [];

      if (req.params.template.toLowerCase() == "sidebartext")
        data.photo = null;

      const v = { sidebar_data: JSON.stringify(data) };

      templateName = type;
      adjustmentList.push({
        id: uuidv4(),
        key: (data.firstName + " " + data.lastName).trim().toUpperCase(),
        parameters: { 
          data: JSON.stringify(v)
        },
      });

      if (!isRunningAnything()){
        const first = adjustmentList.shift();
        client.write(JSON.stringify({
          type: "LOAD",
          timelineFile: type,
          parameters: first.parameters,
          instanceName: first.key,
        })+"\n");
      }

      res.send("OK");
    }).error(error => {
      res.status(500).send("Failed to load person: " + error);
    });
  });

  app.post('/api/run/board/:template/:key', (req, res) => {
    console.log("Run board template", req.params);

    function queueBoard(type, data) {
      if (!isRunningTemplate(type) && isRunningAnything())
        return "RUNNING_OTHER";
      if (!isRunningTemplate(type))
        adjustmentList = [];

      templateName = type;
      for(let k of data){
        adjustmentList.push({
          id: uuidv4(),
          key: k[0],
          parameters: { 
            data: JSON.stringify(k[1]),
            name: JSON.stringify({ f1: k[0] }),
          },
        });
      }

      if (!isRunningAnything()){
        const first = adjustmentList.shift();
        client.write(JSON.stringify({
          type: "LOAD",
          timelineFile: type,
          parameters: first.parameters,
          instanceName: first.key,
        })+"\n");
      }
      return "OK";
    }

    function splitWinnersIntoPages(prefix, data){
      const page_count = Math.ceil(data.length / 4);
      const num_4_pages = data.length - (page_count * 3);

      const res_data = [];
      let offset = 0;

      for (let i=1; i<=page_count; i++){        
        const count = num_4_pages >= i ? 4 : 3;
        const cands = data.slice(offset, offset+count);
        offset += count;

        console.log(data.length, cands.length, offset);

        const page_data = {
          position: prefix,
        };

        if (cands.length > 0){
          const c = cands[0];
          page_data.win1_name = c.firstName + " " + c.lastName;
          page_data.win1_position = c.Position.fullName;
          if (c.photo)
            page_data.win1_photo = trimPhoto(c.photo);
        }
        if (cands.length > 1){
          const c = cands[1];
          page_data.win2_name = c.firstName + " " + c.lastName;
          page_data.win2_position = c.Position.fullName;
          if (c.photo)
            page_data.win2_photo = trimPhoto(c.photo);
        }
        if (cands.length > 2){
          const c = cands[2];
          page_data.win3_name = c.firstName + " " + c.lastName;
          page_data.win3_position = c.Position.fullName;
          if (c.photo)
            page_data.win3_photo = trimPhoto(c.photo);
        }
        if (cands.length > 3){
          const c = cands[3];
          page_data.win4_show = true;
          page_data.win4_name = c.firstName + " " + c.lastName;
          page_data.win4_position = c.Position.fullName;
          if (c.photo)
            page_data.win4_photo = trimPhoto(c.photo);
        } else {
          page_data.win4_show = false;
        }

        res_data.push([ prefix + " " + i, page_data ]);
      }

      return res_data;
    }

    function trimPhoto(photo){
      if (photo.indexOf("data:image/png;base64,") == 0)
        return photo.substring("data:image/png;base64,".length);
      return photo;
    }

    switch (req.params.template.toLowerCase()){
      case "winnersall":
        return getWinnersOfType(Models, "candidateSabb").then(function(sabbs){
          return getWinnersOfType(Models, "candidateNonSabb").then(function(nonsabbs){
            const data = splitWinnersIntoPages("Part-time Officer Elects", nonsabbs);
            const data2 = splitWinnersIntoPages("Full-time Officer Elects", sabbs);
            const comb = data.concat(data2);

            res.send(queueBoard("winners", comb));
          });
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "winnersnonsabbs":
        return getWinnersOfType(Models, "candidateNonSabb").then(function(nonsabbs){
          const data = splitWinnersIntoPages("Part-time Officer Elects", nonsabbs);

          res.send(queueBoard("winners", data));

        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "winnerssabbs":
        return getWinnersOfType(Models, "candidateSabb").then(function(people){
          const data = splitWinnersIntoPages("Full-time Officer Elects", people);

          res.send(queueBoard("winners", data));
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "candidateboard":
        return Position.findById(req.params.key, {
          include: [{
            model: Person,
            order: [
              [ "order", "ASC" ],
              [ "lastName", "ASC" ]
            ]
          }]
        }).then(function(position){

          const data = [
            [ position.fullName, buildCandidateForPosition(position) ],
          ];

          res.send(queueBoard("candidates", data));
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "candidateall":
        return candidatesForType(Models, null)
          .then(data => res.send(queueBoard("candidates", data)))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });

      case "candidatesabbs":
        return candidatesForType(Models, "candidateSabb")
          .then(data => res.send(queueBoard("candidates", data)))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });

      case "candidatenonsabbs":
        return candidatesForType(Models, "candidateNonSabb")
          .then(data => res.send(queueBoard("candidates", data)))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });
    }

    res.send("OK");
  });
}

function candidatesForType(Models, type){
  const { Person, Position } = Models;

  const candType = type ? [ type ] : [ "candidateSabb", "candidateNonSabb" ];
  return Position.findAll({
    order: [[ "type", "DESC" ], [ "order", "ASC" ]],
    where: {
      type: {
        $in: candType
      }
    },
    include: [{
      model: Person,
      include: [ Position ],
      order: [[ "order", "ASC" ], [ "lastName", "ASC" ]]
    }]
  }).then(positions => {
    return positions.map(pos => [ pos.fullName, buildCandidateForPosition(pos) ]);
  });
}

function buildCandidateForPosition(pos){
  const compiledData = {
    candidates: pos.People,
    position: pos.toJSON()
  };
  compiledData.position.People = undefined;

  if (compiledData.candidates.length == 0){
    compiledData.candidates = [ generateRon(pos) ];
  }

  return compiledData;
}