const config = require('../config');
var linq = require('linq');
var builder = require('xmlbuilder');
var mapSeries = require('promise-map-series');
const cors = require('cors');

import { generateRon } from './ron';

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

}

function generateResponseXML(Models, pid){
  const { Person, Position, Vote, RoundElimination } = Models;

  if (!pid)
    pid = GRAPHROLE.id;

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
}
