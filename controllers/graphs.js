const config = require('../config');
var linq = require('linq');
var CasparCG = require("caspar-cg");
var builder = require('xmlbuilder');
var mapSeries = require('promise-map-series');
const cors = require('cors');

import { generateRon } from './ron';

var ccg = new CasparCG(config.ccgHost, config.ccgPort);
ccg.on("connected", function () {
  console.log("Connected to CasparCG");
  //setup initial source

  ccg.sendCommand("CLEAR 1-"+config.ccgGraphLayer+"");
});
ccg.connect();

var io = null;
var currentIds = [];

var GRAPHROLE = {};

export function setup(Models, app){
  let { Person, Position, Vote, RoundElimination } = Models;

  // DEV ONLY!!
  Position.filter({ miniName: "President" }).run().then(function (positions){
    console.log(positions)
    if(!positions || positions.length == 0)
      return;

    GRAPHROLE = positions[0]
  });

  app.get('/graph', cors(), (req, res) => {
    // DEV ONLY:
    // Position.run().then(function (positions){
    //   console.log(positions)
    //   if(!positions || positions.length == 0)
    //     return res.send("ERR GET POSITION");

    //   const i = Math.floor(Math.random() * positions.length);
    //   GRAPHROLE = positions[i];

    //   generateResponseXML(Models).then(str => res.send(str));
    // });

    generateResponseXML(Models).then(str => res.send(str));
  });

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

function generateResponseXML(Models){
  const { Person, Position, Vote, RoundElimination } = Models;

  if (!GRAPHROLE.id)
    return "NO ROLE";

  const rootElm = builder.create('root');
  rootElm.ele('position', { id: GRAPHROLE.miniName }, GRAPHROLE.fullName);
  const candidates = rootElm.ele('candidates');
  const rounds = rootElm.ele('rounds');

  const ronId = "ron-"+GRAPHROLE.id;

  return Person.filter({ positionId: GRAPHROLE.id }).run().then(function(people){
    if (!people || people.length == 0)
      return "NO PEOPLE";

    people = linq.from(people)
      .orderBy((x) => x.order)
      .toArray();

    people.push(generateRon(GRAPHROLE));

    people.forEach(p => {
      candidates.ele('candidate', { id: p.id }, p.firstName + " " + p.lastName);
    });

    return RoundElimination.filter({ positionId: GRAPHROLE.id }).run().then(function(eliminated){
      const arr = eliminated.map(e => e.round)
      const data = arr.filter(function(v,i) { return i==arr.lastIndexOf(v); }).sort();
      data.push(Math.max(Math.max.apply(null, data), -1) +1)

      return mapSeries(data, r => {
          const elm = rounds.ele('round', { number: r+1 });

          return mapSeries(people, p => {
            return Vote.filter({ personId: p.id, round: r }).run().then(function(votes){
              const elim = eliminated.filter(v => v.round < r && v.personId == p.id).length > 0;
              const count = (!votes || votes.length == 0) ? undefined : votes[0].votes;

              const props = { candidate: p.id };
              if (elim)
                props.eliminated = true;

              elm.ele('result', props, count);

              return p.id
            });
          });
      }).then(() => {
        return rootElm.end({ pretty: true});
      });
    });
  });
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
            


              var person = generateRon(GRAPHROLE)

              Vote.save({
                personId: person.id,
                positionId: GRAPHROLE.id,
                round: round,
                votes: count
              }).then(function(){
                //send to graphic
                io.graphAddVote(id, count);
              })
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
    let { Position } = Models;
    console.log("Saving Eliminate ", id);

    RoundElimination.filter({ personId: id }).run().then(function(eliminations){
      if(!eliminations || eliminations.length == 0){
        Person.filter({ id }).run().then(function(people){
          if(people.length == 0){
              var person = generateRon(GRAPHROLE)

              RoundElimination.save({
                personId: person.id,
                positionId: GRAPHROLE.id,
                round: round
              }).then(function(){
                //send to graphic
                io.graphEliminate(id);
              })
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

      GRAPHROLE = positions[0]

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
