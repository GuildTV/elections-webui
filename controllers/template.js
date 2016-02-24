var net = require('net');
var linq = require('linq');

var lastState = {};
var pingInterval = null;

var client = new net.Socket();
client.setNoDelay(true);
client.setTimeout(500);

client.on('error', () => {
  console.log("lost connection to cviz");

  client.destroy();
  client.unref();
  client.connect(3456, "10.42.13.100", () => {
    console.log("reconnected");
  });
});

client.connect(3456, '10.42.13.100', function() {
  console.log('Connected to cviz');

  pingInterval = setInterval(() => {
    client.write("{}");
  }, 300)
});

client.on('data', (data) => {
  try {
    if(data == "{}")
      return;

    lastState = JSON.parse(data);
    console.log("Received", lastState);
  } catch (e){
  }
});

client.on('close', () => {
  console.log("Server has gone away!");
  if(pingInterval != null){
    clearInterval(pingInterval);
    pingInterval = null;
  }
});

export default function(Models, socket, config){
  let { Person, Position } = Models;

  socket.emit('templateState', lastState);
  
  client.on('data', (data) => {
    try {
      if(data == "{}")
        return;

      data = JSON.parse(data);

      socket.emit('templateState', data);
    } catch (e){
    }
  });

  socket.on('runTemplate', data => {
    console.log("runTemplate", data);

    // not pretty, but data needs to be passed as an object of strings
    var templateData = {};

    if(data.template.toLowerCase() == "lowerthird"){
      if(!data.data || !data.data.candidate)
        return;

      for(var key in data.data) {
        var candidate = data.data[key];
        var name = (candidate.firstName + " " + candidate.lastName).trim().toUpperCase();
        var role = (candidate.position.fullName + (candidate.elected?" elect":"")).trim().toUpperCase();

        templateData[key] =  "<templateData>"
        + "<componentData id=\"f0\"><data id=\"text\" value=\"" + name + "\" /></componentData>"
        + "<componentData id=\"f1\"><data id=\"text\" value=\"" + role + "\" /></componentData>"
        + "</templateData>";
      }

    } else if (data.template.toLowerCase() == "candidatesabbs" || data.template.toLowerCase() == "candidatenonsabbs") {
      var type = (data.template.toLowerCase() == "candidatesabbs") ? "candidateSabb" : "candidateNonSabb";
      Person.getJoin({position: true}).filter({ 
        position: {
          type: type
        }
      }).run().then(function(people){
        var grouped = linq.from(people)
          .orderBy((x) => x.position.order)
          .thenBy((x) => x.lastName)
          .groupBy((x) => x.position.id)
          .toArray();

        var templateData = {};
        var index = 1;
        grouped.forEach((g) => {
          var compiledData = {
            candidates: g.toArray(),
            position: g.first().position
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
      getWinnersOfType(Person, "candidateSabb").then(function(sabbs){
        getWinnersOfType(Person, "candidateNonSabb").then(function(people){
          var half_length = Math.ceil(people.length / 2);  
          var page1 = people.splice(0, half_length);


          var compiledSabbs = {
            candidates: sabbs
          };
          var compiledData = {
            candidates: page1
          };
          var compiledData2 = {
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
      getWinnersOfType(Person, "candidateNonSabb").then(function(people){
        var half_length = Math.ceil(people.length / 2);  
        var page1 = people.splice(0, half_length);


        var compiledData = {
          candidates: page1
        };
        var compiledData2 = {
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
      getWinnersOfType(Person, "candidateSabb").then(function(people){
        var compiledData = {
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
      var compiledData = {};
      Position.filter({id: data.data}).run().then(function(positions){
        if(positions.length == 0)
          return;

        compiledData.position = positions[0];

        Person.filter({positionId: data.data}).run().then(function(people){
          compiledData.candidates = people;

          templateData["data"] = "<templateData><componentData id=\"data\"><![CDATA[" + JSON.stringify(compiledData) + "]]></componentData></templateData>";

          client.write(JSON.stringify({
            type: "LOAD",
            filename: data.template,
            templateData: templateData,
            templateDataId: data.dataId
          }));
        });
      });
      return;
    }else {
      for(var key in data.data) {
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

  socket.on('templateGo', data => {
    console.log("templateGo");

    client.write(JSON.stringify({
      type: "CUE"
    }));
  });

  socket.on('templateKill', data => {
    console.log("templateKill");

    client.write(JSON.stringify({
      type: "KILL"
    }));
  });

  // TODO - send templateState at appropriate points
  // data format: 
  // {
  //   state: "STOP", // or WAIT or PLAYING
  //   dataId: "ado-ben",
  //   templateId: "lowerThird"
  // }
}

function getWinnersOfType(Person, type){
  return Person.getJoin({position: true}).filter({ 
    elected: true, 
    position: {
      type: type
    }
  }).run();
}