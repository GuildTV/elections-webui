const config = require('../config');
const linq = require('linq');
const builder = require('xmlbuilder');
const mapSeries = require('promise-map-series');
const cors = require('cors');

import { generateRon } from './ron';

let GRAPHROLE = { // When in manual mode
  id: null,
  round: null
};

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

    if (GRAPHROLE.id){
      // use hardcoded value
      generateResponseXML(Models, GRAPHROLE.id, GRAPHROLE.round).then(str => res.send(str));
    } else {
      res.send("TODO - proxy sabbgraph");
    }
  });
}

export function bind(Models, socket){
  let { Person, Vote, RoundElimination } = Models;

  socket.on('getElections', (data) => {
    console.log("Get Elections data: ", data.position);

    if(!data.position)
      return;

    generateResponseXML(Models, data.position).then(str => socket.emit('getElections', str));
  });

  socket.on('showResults', data => {
    console.log("Force results:", data)
    GRAPHROLE = data;
    socket.emit('currentGraphId', GRAPHROLE);
  });

  socket.on('currentGraphId', () => {
    console.log("Cur Graph ID");
    socket.emit('currentGraphId', GRAPHROLE);
  })
}

function generateResponseXML(Models, pid, maxRound){
  const { Person, Position, Vote, RoundElimination } = Models;

  return Position.filter({ id: pid }).run().then(function (positions){
    if(!positions || positions.length == 0)
      return "BAD POSITION";

    const position = positions[0];

    if (!position.id)
      return "NO ROLE";

    const rootElm = builder.create('root');
    rootElm.ele('position', { id: position.miniName }, position.fullName);
    const candidates = rootElm.ele('candidates');
    const rounds = rootElm.ele('rounds');

    const ronId = "ron-"+position.id;

    return Person.filter({ positionId: position.id }).run().then(function(people){
      if (!people || people.length == 0)
        return "NO PEOPLE";

      people = linq.from(people)
        .orderBy((x) => x.order)
        .toArray();

      people.push(generateRon(position));

      people.forEach(p => {
        candidates.ele('candidate', { id: p.id }, p.firstName + " " + p.lastName);
      });

      return RoundElimination.filter({ positionId: position.id }).run().then(function(eliminated){
        const arr = eliminated.map(e => e.round)
        const data = arr.filter(function(v,i) { return i==arr.lastIndexOf(v); }).sort();
        data.push(Math.max(Math.max.apply(null, data), -1) +1)

        const filtered = maxRound >= 0
          ? data.filter(r => r <= maxRound)
          : data;

        return mapSeries(filtered, r => {
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
  });
}
