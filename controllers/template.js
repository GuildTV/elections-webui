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
    client.write("{}");
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

export default function(Models, socket){
  let { Person, Position } = Models;

  socket.emit('templateState', lastState);

  client.on('data', (data) => {
    try {
      if(data == "{}")
        return;

      data = JSON.parse(data);

      socket.emit('templateState', data);
    } catch (e){
        console.log("Error", e);
    }
  });

  socket.on('runTemplate', data => {
    console.log("runTemplate", data);

    // not pretty, but data needs to be passed as an object of strings
    const templateData = {};

    if(data.template.toLowerCase() == "lowerthird"){
      if(!data.data || !data.data.candidate)
        return;

      for(const key in data.data) {
        const person = data.data[key];
        const name = (person.firstName + " " + person.lastName).trim().toUpperCase();
        let role = person.position.fullName.trim().toUpperCase();
        if(person.position.type != "other"){
          role += (person.elected ? " elect" : " candidate").toUpperCase();
        }

        templateData[key] =  "<templateData>"
        + "<componentData id=\"f0\"><data id=\"text\" value=\"" + name + "\" /></componentData>"
        + "<componentData id=\"f1\"><data id=\"text\" value=\"" + role + "\" /></componentData>"
        + "</templateData>";
      }

    } else if (data.template.toLowerCase() == "candidatesabbs" || data.template.toLowerCase() == "candidatenonsabbs") {
      let type = (data.template.toLowerCase() == "candidatesabbs") ? "candidateSabb" : "candidateNonSabb";

      Position.findAll({
        where: {
          type: type
        },
        order: [[ "order", "ASC" ]],
        include: [{
          model: Person,
          include: [ Position ],
          order: [[ "order", "ASC" ], [ "lastName", "ASC" ]]
        }]
      }).then(positions => {
        const templateData = {};
        let index = 1;
        positions.forEach((pos) => {
          const compiledData = {
            candidates: pos.People,
            position: pos
          };

          templateData["data" + (index++)] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";
        });

        console.log("Found " + (index-1) + " groups of candidates");

        client.write(JSON.stringify({
          type: "LOAD",
          filename: data.template,
          templateData: templateData,
          templateDataId: data.dataId
        }));
      });

      return;
    } else if (data.template.toLowerCase() == "winnersall"){
      getWinnersOfType(Models, "candidateSabb").then(function(sabbs){
        getWinnersOfType(Models, "candidateNonSabb").then(function(people){
          const half_length = Math.ceil(people.length / 2);
          const page1 = people.splice(0, half_length);


          const compiledSabbs = {
            candidates: sabbs
          };
          const compiledData = {
            candidates: page1
          };
          const compiledData2 = {
            candidates: people
          };

          templateData["nonsabbs1"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";
          templateData["nonsabbs2"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData2) + "]]></componentData></templateData>";
          templateData["sabbs"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledSabbs) + "]]></componentData></templateData>";

          client.write(JSON.stringify({
            type: "LOAD",
            filename: data.template,
            templateData: templateData,
            templateDataId: data.dataId
          }));
        });
      });

      return;
    } else if (data.template.toLowerCase() == "winnersnonsabbs"){
      getWinnersOfType(Models, "candidateNonSabb").then(function(people){
        const half_length = Math.ceil(people.length / 2);
        const page1 = people.splice(0, half_length);


        const compiledData = {
          candidates: page1
        };
        const compiledData2 = {
          candidates: people
        };

        templateData["data1"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";
        templateData["data2"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData2) + "]]></componentData></templateData>";

        client.write(JSON.stringify({
          type: "LOAD",
          filename: data.template,
          templateData: templateData,
          templateDataId: data.dataId
        }));
      });

      return;
    } else if (data.template.toLowerCase() == "winnerssabbs"){
      getWinnersOfType(Models, "candidateSabb").then(function(people){
        const compiledData = {
          candidates: people
        };

        templateData["data"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";

        client.write(JSON.stringify({
          type: "LOAD",
          filename: data.template,
          templateData: templateData,
          templateDataId: data.dataId
        }));
      });

      return;
    } else if (data.template.toLowerCase() == "candidateboard") {
      const compiledData = {};
      Position.findById(data.data, {
        include: [{
          model: Person,
          order: [
            [ "order", "ASC" ],
            [ "lastName", "ASC" ]
          ]
        }]
      }).then(function(position){
        if(!position)
          return;

        compiledData.position = position;

        compiledData.candidates = position.People;

        templateData["data"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";

        client.write(JSON.stringify({
          type: "LOAD",
          filename: data.template,
          templateData: templateData,
          templateDataId: data.dataId
        }));
      });
      return;
    }else {
      for(const key in data.data) {
        templateData[key] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(data.data[key]) + "]]></componentData></templateData>";
      }
    }

    client.write(JSON.stringify({
      type: "LOAD",
      filename: data.template,
      templateData: templateData,
      templateDataId: data.dataId
    }));
  });

  socket.on('templateGo', () => {
    console.log("templateGo");

    client.write(JSON.stringify({
      type: "CUE"
    }));
  });

  socket.on('templateKill', () => {
    console.log("templateKill");

    client.write(JSON.stringify({
      type: "KILL"
    }));
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
      }
    }]
  }).then(positions => {
    return positions.map(v => {
      if (v.People && v.People[0])
        return v.People[0];

      return generateRon(v);
    });
  });
}
