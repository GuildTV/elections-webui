var net = require('net');

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

    } else {
      for(var key in data.data) {
        templateData[key] = JSON.stringify(data.data[key]);
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
