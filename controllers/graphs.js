const config = require('../config');
var linq = require('linq');

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

      var labels = [];
      currentIds = [];

      //compile labels and map of ids
      for(let p of sortedPeople){
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