export default function(Models, socket, config){

  socket.on('runTemplate', data => {
    console.log("TODO - runTemplate",data);
  });

  socket.on('templateGo', data => {
    console.log("TODO - templateGo",data);
  });

  socket.on('templateKill', data => {
    console.log("TODO - templateKill",data);
  });

  // TODO - send templateState at appropriate points
  // data format: 
  // {
  //   state: "STOP", // or WAIT or PLAYING
  //   dataId: "ado-ben",
  //   templateId: "lowerThird"
  // }
}
