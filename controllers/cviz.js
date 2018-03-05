const net = require('net');
const uuidv4 = require('uuid/v4');
import equal from 'deep-equal';

import { generateRon } from './ron';
import { cvizHost, cvizPort } from '../config';

class CvizSlot {
  constructor(slot){
    this.slot = slot;
    this.lastState = {};
    this.templateName = null;
    this.adjustmentList = [];
  }

  isRunningTemplate(name){
    if (!this.lastState || !this.lastState.timelineFile)
      return false;

    return this.lastState.timelineFile == name;
  }

  isRunningAnything(){
    if (!this.lastState || !this.lastState.state)
      return false;

    return this.lastState.state.toLowerCase() != "clear";
  }

  buildClientState(){
    if (!this.lastState || !this.lastState.state)
      return this.lastState;

    if (this.lastState.timelineFile != this.templateName && this.lastState.state.toLowerCase() != "clear"){
      this.adjustmentList = [];
      this.templateName = this.lastState.timelineFile;
    }

    if (this.lastState.state.toLowerCase() == "cueorchild"){
      if (this.adjustmentList.length > 0)
        return Object.assign({}, this.lastState, {
          state: "cue",
          stateMessage: "Load adjustment: " + this.adjustmentList[0].key,
        });
      else
        return Object.assign({}, this.lastState, {
          state: "cue",
        });
    }

    return this.lastState;
  }
}

const slots = {
  default: new CvizSlot("default"),
  lowerthird: new CvizSlot("lowerthird"),
};

let pingInterval = null;

const websocketHandlers = [];

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
    const state = slots[blob.timelineSlot];
    if (!state)
      return; // Not a slot we care about

    if (equal(blob, state.lastState))
      return;

    state.lastState = blob;

    // emit to all handlers
    for (let h of websocketHandlers)
      h(blob.timelineSlot);

    // if lt and nothing loaded, then load next
    if (blob.timelineSlot == "lowerthird" && !state.isRunningAnything() && state.adjustmentList.length > 0){
      const first = state.adjustmentList.shift();
      client.write(JSON.stringify({
        timelineSlot: "lowerthird",
        type: "LOAD",
        timelineFile: "lowerthird",
        parameters: first.parameters,
        instanceName: first.key,
      })+"\n");
    }

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

export function bind(Models, socket, io){

  function emitStatus(slot){
    const state = slots[slot];
    if (!state)
      return;

    socket.emit('cviz.status', {
      slot: slot,
      data: {
        state: state.buildClientState(),
        adjustments: state.adjustmentList,
      }
    });
  }

  websocketHandlers.push(emitStatus)
  socket.on('disconnect', () => {
    const index = websocketHandlers.indexOf(emitStatus);
    if (index > -1)
      websocketHandlers.splice(index, 1);
  });

  socket.on('cviz.status', r => emitStatus(r.slot));
}

export function setup(Models, app){
  const { Person, Position } = Models;

  app.delete('/api/cviz/:slot/adjustment/:id', (req, res) => {
    const state = slots[req.params.slot];
    if (!state)
      return res.status(500).send("");

    state.adjustmentList = state.adjustmentList.filter(a => a.id != req.params.id);

    res.send("OK");
  });

  app.post('/api/cviz/:slot/adjustment/clear', (req, res) => {
    const state = slots[req.params.slot];
    if (!state)
      return res.status(500).send("");

    state.adjustmentList = [];

    res.send("OK");
  });

  app.post('/api/cviz/:slot/adjustment/next/:id', (req, res) => {
    const state = slots[req.params.slot];
    if (!state)
      return res.status(500).send("");

    const entry = state.adjustmentList.find(a => a.id == req.params.id);
    if (!entry){
      res.status(500).send("Failed to find");
      return;
    }

    state.adjustmentList = state.adjustmentList.filter(a => a.id != req.params.id);
    state.adjustmentList.unshift(entry);

    res.send("OK");
  });

  app.post('/api/cviz/:slot/cue', (req, res) => {
    const state = slots[req.params.slot];
    if (!state)
      return res.status(500).send("");

    console.log("templateGo");

    if ((state.lastState.state || "").toLowerCase() == "cueorchild" && state.adjustmentList.length > 0){
      const adjust = state.adjustmentList.shift();
      client.write(JSON.stringify({
        timelineSlot: req.params.slot,
        type: "RUNCHILD",
        parameters: adjust.parameters,
        instanceName: adjust.key,
      })+"\n");
      res.send("OK");

      return;
    }

    client.write(JSON.stringify({
      timelineSlot: req.params.slot,
      type: "CUE"
    })+"\n");
    res.send("OK");
  });

  app.post('/api/cviz/:slot/cue/direct', (req, res) => {
    const state = slots[req.params.slot];
    if (!state)
      return res.status(500).send("");

    console.log("templateGo-direct");

    client.write(JSON.stringify({
      timelineSlot: req.params.slot,
      type: "CUE"
    })+"\n");
    res.send("OK");
  });

  app.post('/api/cviz/:slot/kill', (req, res) => {
    const state = slots[req.params.slot];
    if (!state)
      return res.status(500).send("");

    console.log("templateKill");

    state.templateName = null;
    state.adjustmentList = [];

    client.write(JSON.stringify({
      timelineSlot: req.params.slot,
      type: "KILL"
    })+"\n");
    res.send("OK");
  });

  app.post('/api/run/lowerthird', (req, res) => {
    console.log("Run template for data", req.body);

    const state = slots["lowerthird"];
    if (!state)
      return res.status(500).send("");

    if (!state.isRunningTemplate("lowerthird") && state.isRunningAnything())
      return res.send("RUNNING_OTHER");
    if (!state.isRunningTemplate("lowerthird"))
      state.adjustmentList = [];

    const type = req.body.headline ? "GE2018/LT-ANI-HEADLINE" : "GE2018/LT-ANI-GREY";

    const v = { 
      f0: req.body.f0 || "GUILD ELECTIONS 2018",
      f1: req.body.f1 || "",
    };

    state.templateName = "lowerthird";
    state.adjustmentList.push({
      id: uuidv4(),
      key: (v.f0 + " " + v.f1).trim().toUpperCase(),
      parameters: { 
        data: JSON.stringify(v),
        type: type
      },
    });

    if (!state.isRunningAnything()){
      const first = state.adjustmentList.shift();
      client.write(JSON.stringify({
        timelineSlot: "lowerthird",
        type: "LOAD",
        timelineFile: "lowerthird",
        parameters: first.parameters,
        instanceName: first.key,
      })+"\n");
    }

    res.send("OK");
  });

  app.post('/api/run/lowerthird/:id', (req, res) => {
    console.log("Run template for person", req.params);

    const state = slots["lowerthird"];
    if (!state)
      return res.status(500).send("");

    return Person.findById(req.params.id, {
      include: [ Position ]
    }).then(data => {
      if (!state.isRunningTemplate("lowerthird") && state.isRunningAnything())
        return res.send("RUNNING_OTHER");
      if (!state.isRunningTemplate("lowerthird"))
        state.adjustmentList = [];

      const suffix = data.Position.type.indexOf("candidate") == 0 ? (data.elected ? " Elect" : " Candidate") : "";

      const v = { 
        f0: (data.firstName + " " + data.lastName + (data.firstName2 ? " & " + data.firstName2 + " " + data.lastName2 : "")).trim(),
        f1: data.Position.fullName + suffix,
      };

      state.templateName = "lowerthird";
      state.adjustmentList.push({
        id: uuidv4(),
        key: (data.firstName + " " + data.lastName).trim().toUpperCase(),
        parameters: { 
          data: JSON.stringify(v),
          type: "GE2018/LT-ANI-GREY"
        },
      });

      if (!state.isRunningAnything()){
        const first = state.adjustmentList.shift();
        client.write(JSON.stringify({
          timelineSlot: "lowerthird",
          type: "LOAD",
          timelineFile: "lowerthird",
          parameters: first.parameters,
          instanceName: first.key,
        })+"\n");
      }

      res.send("OK");
    }).error(error => {
      res.status(500).send("Failed to load person: " + error);
    });
  });

  app.post('/api/run/person/:id/:template', (req, res) => {
    console.log("Run template for person", req.params);

    const state = slots["default"];
    if (!state)
      return res.status(500).send("");

    return Person.findById(req.params.id, {
      include: [ Position ]
    }).then(data => {
      let type = req.params.template;
      if (type.toLowerCase() == "sidebarphoto" || type.toLowerCase() == "sidebartext")
        type = "sidebar";

      if (!state.isRunningTemplate(type) && state.isRunningAnything())
        return res.send("RUNNING_OTHER");
      if (!state.isRunningTemplate(type))
        state.adjustmentList = [];

      if (req.params.template.toLowerCase() == "sidebartext")
        data.photo = null;

      const v = { sidebar_data: JSON.stringify(data) };

      state.templateName = type;
      state.adjustmentList.push({
        id: uuidv4(),
        key: (data.firstName + " " + data.lastName).trim().toUpperCase(),
        parameters: { 
          data: JSON.stringify(v)
        },
      });

      if (!state.isRunningAnything()){
        const first = state.adjustmentList.shift();
        client.write(JSON.stringify({
          timelineSlot: "default",
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

    const state = slots["default"];
    if (!state)
      return res.status(500).send("");

    function queueBoard(type, data) {
      if (!state.isRunningTemplate(type) && state.isRunningAnything())
        return "RUNNING_OTHER";
      if (!state.isRunningTemplate(type))
        state.adjustmentList = [];

      state.templateName = type;
      for(let k of data){
        state.adjustmentList.push({
          id: uuidv4(),
          key: k[0],
          parameters: { 
            data: JSON.stringify(k[1]),
            name: JSON.stringify({ f1: k[0] }),
          },
        });
      }

      if (!state.isRunningAnything()){
        const first = state.adjustmentList.shift();
        client.write(JSON.stringify({
          timelineSlot: "default",
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
          page_data.win1_name = c.firstName2 ? c.firstName + " " + c.lastName + " & " + c.firstName2 + " " + c.lastName2 : c.firstName + " " + c.lastName;
          page_data.win1_position = c.Position.fullName;
          if (c.photo)
            page_data.win1_photo = trimPhoto(c.photo);
        }
        if (cands.length > 1){
          const c = cands[1];
          page_data.win2_name = c.firstName2 ? c.firstName + " " + c.lastName + " & " + c.firstName2 + " " + c.lastName2 : c.firstName + " " + c.lastName;
          page_data.win2_position = c.Position.fullName;
          if (c.photo)
            page_data.win2_photo = trimPhoto(c.photo);
        }
        if (cands.length > 2){
          const c = cands[2];
          page_data.win3_name = c.firstName2 ? c.firstName + " " + c.lastName + " & " + c.firstName2 + " " + c.lastName2 : c.firstName + " " + c.lastName;
          page_data.win3_position = c.Position.fullName;
          if (c.photo)
            page_data.win3_photo = trimPhoto(c.photo);
        }
        if (cands.length > 3){
          const c = cands[3];
          page_data.win4_show = true;
          page_data.win4_name = c.firstName2 ? c.firstName + " " + c.lastName + " & " + c.firstName2 + " " + c.lastName2 : c.firstName + " " + c.lastName;
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

          const data = [];

          if (position.People.length > 8) {
            const split = Math.floor(position.People.length/2);
            data.push([ position.fullName, buildCandidateForPosition(position, position.People.slice(0, split)) ]);
            data.push([ position.fullName, buildCandidateForPosition(position, position.People.slice(split)) ]);
          } else {
            data.push([ position.fullName, buildCandidateForPosition(position, position.People) ]);
          }

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
    const data = [];

    positions.forEach(p => {
     if (p.People.length > 8) {
        const split = Math.floor(p.People.length/2);
        data.push([ p.fullName, buildCandidateForPosition(p, p.People.slice(0, split)) ]);
        data.push([ p.fullName, buildCandidateForPosition(p, p.People.slice(split)) ]);
      } else {
        data.push([ p.fullName, buildCandidateForPosition(p, p.People) ]);
      }
    })

    return data;
  });
}

function buildCandidateForPosition(pos, ppl){
  const compiledData = {
    candidates: ppl,
    position: pos.toJSON()
  };
  compiledData.position.People = undefined;

  if (compiledData.candidates.length == 0){
    compiledData.candidates = [ generateRon(pos) ];
  }

  return compiledData;
}