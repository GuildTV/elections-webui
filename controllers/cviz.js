const net = require('net');
const uuidv4 = require('uuid/v4');

const cvizSlot = "default";

let lastState = {};

let pingInterval = null;

let adjustmentList = [];
let templateName = null;

//DEV
adjustmentList = [
  // { id: uuidv4(), key: "ado", data: "" },
  // { id: uuidv4(), key: "rro", data: "" },
  // { id: uuidv4(), key: "hco", data: "" },
  // { id: uuidv4(), key: "wo", data: "" },
  // { id: uuidv4(), key: "wo", data: "" },
  // { id: uuidv4(), key: "pres", data: "" },
  // { id: uuidv4(), key: "iso", data: "" },
  // { id: uuidv4(), key: "lgbtqso", data: "" },
  // { id: uuidv4(), key: "eeo", data: "" },
  // { id: uuidv4(), key: "eo", data: "" },
  // { id: uuidv4(), key: "pgso", data: "" },
  // { id: uuidv4(), key: "hso", data: "" },
  // { id: uuidv4(), key: "emso", data: "" },
  // { id: uuidv4(), key: "arafo", data: "" },
]

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
        stateMessage: "Start adjustment: " + adjustmentList[0].key,
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
    console.log("Error", e);
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
      res.sendStatus(500).send("Failed to find");
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

    if (lastState.state.toLowerCase() == "cueorchild" && adjustmentList.length > 0){
      const adjust = adjustmentList.shift();
      client.write(JSON.stringify({
        type: "RUNCHILD",
        parameters: {},
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
      // Special handling for lowerthird as it is flash and wants a subset of the data
      if (req.params.template.toLowerCase() == "lowerthird"){
        const name = (data.firstName + " " + data.lastName).trim().toUpperCase();
        let role = data.Position.fullName.trim().toUpperCase();
        if(data.Position.type != "other"){
          role += (data.elected ? " elect" : " candidate").toUpperCase();
        }

        const templateData = {
          candidate: "<templateData>"
            + "<componentData id=\"f0\"><data id=\"text\" value=\"" + name + "\" /></componentData>"
            + "<componentData id=\"f1\"><data id=\"text\" value=\"" + role + "\" /></componentData>"
            + "</templateData>"
        };

        client.write(JSON.stringify({
          type: "LOAD",
          timelineFile: req.params.template,
          parameters: templateData,
          instanceName: data.uid
        })+"\n");

        res.send("OK");
        return;
      }

      const templateData = {
        candidate: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(data) + "]]></componentData></templateData>"
      };

      client.write(JSON.stringify({
        type: "LOAD",
        timelineFile: req.params.template,
        parameters: templateData,
        instanceName: data.uid
      })+"\n");

      res.send("OK");
    }).error(error => {
      res.status(500).send("Failed to load person: " + error);
    });
  });

  app.post('/api/run/board/:template/:key', (req, res) => {
    console.log("Run board template", req.params);

    function queueWinners(data) {
      if (!isRunningTemplate("winners") && isRunningAnything())
        return "RUNNING_OTHER";
      if (!isRunningTemplate("winners"))
        adjustmentList = [];

      templateName = "winners";
      for(let k of data){
        adjustmentList.push({
          id: uuidv4(),
          key: k[0],
          data: { data: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify({ candidates: k[1] }) + "]]></componentData></templateData>" },
        });
      }

      if (!isRunningAnything()){
        const first = adjustmentList.shift();
        client.write(JSON.stringify({
          type: "LOAD",
          timelineFile: "winners",
          parameters: first.data,
          instanceName: first.key,
        })+"\n");
      }
      return "OK";
    }
    function queueCandidates(data) {
      if (!isRunningTemplate("candidates") && isRunningAnything())
        return "RUNNING_OTHER";
      if (!isRunningTemplate("candidates"))
        adjustmentList = [];

      templateName = "candidates";
      for(let k of data){
        adjustmentList.push({
          id: uuidv4(),
          key: k[0],
          data: { data: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify({ candidates: k[1] }) + "]]></componentData></templateData>" },
        });
      }

      if (!isRunningAnything()){
        const first = adjustmentList.shift();
        client.write(JSON.stringify({
          type: "LOAD",
          timelineFile: "candidates",
          parameters: first.data,
          instanceName: first.key,
        })+"\n");
      }
      return "OK";
    }

    switch (req.params.template.toLowerCase()){
      case "winnersall":
        return getWinnersOfType(Models, "candidateSabb").then(function(sabbs){
          return getWinnersOfType(Models, "candidateNonSabb").then(function(nonsabbs){
            const half_length = Math.ceil(nonsabbs.length / 2);
            const nonsabbs1 = nonsabbs.splice(0, half_length);

            const data = [
              [ "Non Sabbs 1", nonsabbs1 ],
              [ "Non Sabbs 2", nonsabbs ],
              [ "Sabbs", sabbs ],
            ];

            res.send(queueWinners(data));
          });
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "winnersnonsabbs":
        return getWinnersOfType(Models, "candidateNonSabb").then(function(nonsabbs){
          const half_length = Math.ceil(nonsabbs.length / 2);
          const nonsabbs1 = nonsabbs.splice(0, half_length);

          const data = [
            [ "Non Sabbs 1", nonsabbs1 ],
            [ "Non Sabbs 2", nonsabbs ],
          ];

          res.send(queueWinners(data));
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "winnerssabbs":
        return getWinnersOfType(Models, "candidateSabb").then(function(people){

          const data = [
            [ "Sabbs", people ],
          ];

          res.send(queueWinners(data));
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

          res.send(queueCandidates(data));
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "candidateall":
        return candidatesForType(Models, null, req.params.template, req.params.key)
          .then(data => res.send(queueCandidates(data)))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });

      case "candidatesabbs":
        return candidatesForType(Models, "candidateSabb", req.params.template, req.params.key)
          .then(data => res.send(queueCandidates(data)))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });

      case "candidatenonsabbs":
        return candidatesForType(Models, "candidateNonSabb", req.params.template, req.params.key)
          .then(data => res.send(queueCandidates(data)))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });
    }

    res.send("OK");
  });
}

function candidatesForType(Models, type, template, key){
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

    const data = [
      // [ position.fullName, buildCandidateForPosition(position) ],
    ];

    // const templateData = {};
    let index = 1;
    positions.forEach((pos) => {
      data.push([ pos.fullName, buildCandidateForPosition(pos) ])
      // templateData["data" + (index++)] = buildCandidateForPosition(pos);
    });

    return data;

    // console.log("Found " + (index-1) + " groups of candidates");

    // client.write(JSON.stringify({
    //   type: "LOAD",
    //   timelineFile: template,
    //   parameters: templateData,
    //   instanceName: key,
    // })+"\n");
  });
}

function buildCandidateForPosition(pos){
  const compiledData = {
    candidates: pos.People,
    position: pos
  };

  if (compiledData.candidates.length == 0){
    compiledData.candidates = [ generateRon(pos) ];
  }

  return "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";
}