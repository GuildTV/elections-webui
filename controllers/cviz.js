const net = require('net');

let lastState = {};
let pingInterval = null;

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

    lastState = JSON.parse(data);
    console.log("Received", lastState);
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

export function bind(Models, socket){
  socket.emit('templateState', lastState);

  client.on('data', (data) => {
    try {
      if(data == "{}" || data == "{}\n")
        return;

      data = JSON.parse(data);

      socket.emit('templateState', data);
    } catch (e){
        console.log("Error", e);
    }
  });
}

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

  app.post('/api/cviz/cue', (req, res) => {
    console.log("templateGo");

    client.write(JSON.stringify({
      type: "CUE"
    })+"\n");
    res.send("OK");
  });

  app.post('/api/cviz/kill', (req, res) => {
    console.log("templateKill");

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

    switch (req.params.template.toLowerCase()){
      case "winnersall":
        return getWinnersOfType(Models, "candidateSabb").then(function(sabbs){
          return getWinnersOfType(Models, "candidateNonSabb").then(function(nonsabbs){
            const half_length = Math.ceil(nonsabbs.length / 2);
            const nonsabbs1 = nonsabbs.splice(0, half_length);

            const compiledSabbs = { candidates: sabbs };
            const compiledData = { candidates: nonsabbs1 };
            const compiledData2 = { candidates: nonsabbs };

            const templateData = {
              nonsabbs1: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>",
              nonsabbs2: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData2) + "]]></componentData></templateData>",
              sabbs: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledSabbs) + "]]></componentData></templateData>",
            };

            client.write(JSON.stringify({
              type: "LOAD",
              timelineFile: req.params.template,
              parameters: templateData,
              instanceName: req.params.key,
            })+"\n");
          res.send("OK");
          });
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "winnersnonsabbs":
        return getWinnersOfType(Models, "candidateNonSabb").then(function(nonsabbs){
          const half_length = Math.ceil(nonsabbs.length / 2);
          const nonsabbs1 = nonsabbs.splice(0, half_length);

          const compiledData = { candidates: nonsabbs1 };
          const compiledData2 = { candidates: nonsabbs };

          const templateData = {
            data1: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>",
            data2: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData2) + "]]></componentData></templateData>",
          };

          client.write(JSON.stringify({
            type: "LOAD",
            timelineFile: req.params.template,
            parameters: templateData,
            instanceName: req.params.key,
          })+"\n");
          res.send("OK");
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "winnerssabbs":
        return getWinnersOfType(Models, "candidateSabb").then(function(people){
          const compiledData = { candidates: people };

          const templateData = {
            data: "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>",
          };

          client.write(JSON.stringify({
            type: "LOAD",
            timelineFile: req.params.template,
            parameters: templateData,
            instanceName: req.params.key,
          })+"\n");
          res.send("OK");
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
          const templateData = {
            data: buildCandidateForPosition(position),
          };

          client.write(JSON.stringify({
            type: "LOAD",
            timelineFile: req.params.template,
            parameters: templateData,
            instanceName: req.params.key,
          })+"\n");
          res.send("OK");
        }).error(error => {
          res.status(500).send("Failed to run: " + error);
        });

      case "candidateall":
        return candidatesForType(Models, null, req.params.template, req.params.key)
          .then(() => res.send("OK"))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });

      case "candidatesabbs":
        return candidatesForType(Models, "candidateSabb", req.params.template, req.params.key)
          .then(() => res.send("OK"))
          .error(error => {
            res.status(500).send("Failed to run: " + error);
          });

      case "candidatenonsabbs":
        return candidatesForType(Models, "candidateNonSabb", req.params.template, req.params.key)
          .then(() => res.send("OK"))
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
    const templateData = {};
    let index = 1;
    positions.forEach((pos) => {
      templateData["data" + (index++)] = buildCandidateForPosition(pos);
    });

    console.log("Found " + (index-1) + " groups of candidates");

    client.write(JSON.stringify({
      type: "LOAD",
      timelineFile: template,
      parameters: templateData,
      instanceName: key,
    })+"\n");
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