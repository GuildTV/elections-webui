const config = require('../config');
var linq = require('linq');
var CasparCG = require("caspar-cg");

var ccg = new CasparCG(config.ccgHost, config.ccgPort);
ccg.on("connected", function () {
  console.log("Connected to CasparCG");
  //setup initial source

  ccg.sendCommand("CLEAR 1-"+config.ccgGraphLayer+"");
});
ccg.connect();

var io = null;
var currentIds = [];

export function setup(Models){
  let { Person, Position, Vote, RoundElimination } = Models;

  io = require('socket.io')(config.graph_websocket_port);

  // Set socket.io listeners.
  io.sockets.on('connection', (socket) => {
    console.log('a graph connected');

    socket.on('disconnect', () => {
      console.log('graph disconnected');
    });

    socket.on('load', ({ role }) => {
      if(!role)
        return;

      sendDataLoad(Models, socket, 'load', role);
    });


  });

  io.graphEliminate = function(id){
    var index = currentIds.indexOf(id)

    if(index < 0)
      return;

    io.sockets.emit('eliminate', { index });
  };

  io.graphAddVote = function(id, count){
    var index = currentIds.indexOf(id)

    if(index < 0)
      return;

    io.sockets.emit('vote', { index, count });
  };
}

export function bind(Models, socket){
  let { Person, Vote, RoundElimination } = Models;

  socket.on('getElections', (data) => {
    console.log("Get Elections data: ", data.position);

    if(!data.position)
      return;

    sendDataLoad(Models, socket, 'getElections', data.position);
  });

  socket.on('saveVote', ({ id, round, count }) => {
    console.log("Saving vote ", id, count);

    Vote.filter({ personId: id, round: round }).run().then(function(votes){
      if(!votes || votes.length == 0){
        Person.filter({ id }).run().then(function(people){
          if(people.length == 0){
            console.log("FAIL")
            return;
          }

          var positionId = people[0].positionId;

          Vote.save({
            personId: id,
            positionId: positionId,
            round: round,
            votes: count
          }).then(function(){
            //send to graphic
            io.graphAddVote(id, count);
          })
        })
      } else {
        var vote = votes[0];
        vote.votes = count;
        vote.save().then(function(){
          //send to graphic
          io.graphAddVote(id, count);
        });
      }
    });
  });

  socket.on('saveEliminate', ({ id, round }) => {
    console.log("Saving Eliminate ", id);

    RoundElimination.filter({ personId: id }).run().then(function(eliminations){
      if(!eliminations || eliminations.length == 0){
        Person.filter({ id }).run().then(function(people){
          if(people.length == 0){
            console.log("FAIL")
            return;
          }

          var positionId = people[0].positionId;

          RoundElimination.save({
            personId: id,
            positionId: positionId,
            round: round
          }).then(function(){
            //send to graphic
            io.graphEliminate(id);
          })
        })
      } else {
        var elimination = eliminations[0];
        elimination.round = round;
        elimination.save().then(function(){
          //send to graphic
          io.graphEliminate(id);
        });
      }
    });
  });

  socket.on('changeGraph', ({ role }) => {
    let { Position } = Models;

    Position.filter({ id: role }).run().then(function (positions){
      if(!positions || positions.length == 0)
        return;

      ccg.sendCommand("CLEAR 1-"+config.ccgGraphLayer)
      ccg.sendCommand("CG 1-"+config.ccgGraphLayer+" ADD 1 \"caspar-graphics/elections-2016-v2/graph\" 1 \"<templateData>"+
        "<componentData id=\\\"id\\\"><data id=\\\"text\\\" value=\\\""+role+"\\\" /></componentData>"+
        "<componentData id=\\\"server\\\"><data id=\\\"text\\\" value=\\\""+config.myGraphSocket+"\\\" /></componentData>"+
        "</templateData>\"");
    });
  });

}

function sendDataLoad(Models, socket, key, role){
  let { Person, Position, Vote, RoundElimination } = Models;

  Position.filter({ id: role }).run().then(function (positions){
    if(!positions || positions.length == 0)
      return socket.emit('fail', {});

    let position = positions[0];

    Person.filter({ positionId: role }).getJoin({position: true}).run().then(function(people){
      var sortedPeople = linq.from(people)
        .orderBy((x) => x.order)
        .toArray();

      sortedPeople.push(generateRon(position));

      var labels = [];
      currentIds = [];

      //compile labels and map of ids
      for(let p of sortedPeople){
        if(!p.lastName || p.lastName.length == 0)
          labels.push(p.firstName.toUpperCase());
        else
          labels.push(p.lastName.toUpperCase());
        
        currentIds.push(p.id);
      }

      RoundElimination.filter({ positionId: role }).run().then(function(eliminated){
        eliminated = eliminated.map((v) => currentIds.indexOf(v.personId));

        Vote.filter({ positionId: role }).run().then(function(votes){
          var compiledVotes = [];

          for(let v of votes){
            if(compiledVotes[v.round] == undefined)
              compiledVotes[v.round] = [];

            var index = currentIds.indexOf(v.personId);
            if(index < 0 || index == null)
              continue;

            compiledVotes[v.round][index] = v.votes;
          }

          var compiledData = {
            position: position,
            labels: labels,
            ids: currentIds,
            eliminated: eliminated,
            votes: compiledVotes
          };

          socket.emit(key, compiledData);
        });
      });
    });
  });
}

function generateRon(position){
  return {
    id: "ron-"+position.id,
    firstName: "RON",
    lastName: "",
    uid: "ron",
    positionId: position.id,
    position: position,
    elected: false,
    manifestoPoints: {
      one: "",
      two: "",
      three: ""
    },
    order: 999,
    photo: "data:image/png;base64,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"
  };
}