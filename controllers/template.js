var net = require('net');

var lastState = {};

var client = new net.Socket();
client.connect(3456, '10.42.13.100', function() {
  console.log('Connected to cviz');
});

client.on('data', (data) => {
  lastState = JSON.parse(data);
  console.log("Received", lastState);
});

client.on('close', () => {
  console.log("Server has gone away!");
});

export default function(Models, socket, config){
  socket.emit('templateState', lastState);
  
  client.on('data', (data) => {
    data = JSON.parse(data);

    socket.emit('templateState', data);
  });

  socket.on('runTemplate', data => {
    console.log("runTemplate", data);

    // not pretty, but data needs to be passed as an object of strings
    var templateData = {};
    for(var key in data.data) {
      templateData[key] = JSON.stringify(data.data[key]);
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
