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
                eliminated: eliminated,
                votes: compiledVotes
              };

              socket.emit('load', compiledData);
            });
          });
        });
      });
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
