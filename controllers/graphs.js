const builder = require('xmlbuilder');
const cors = require('cors');
const xsd = require('libxml-xsd');
const md5 = require('md5');

import fs from 'fs';
import { parseString } from 'xml2js';

import { generateRon } from './ron';

let GRAPHROLE = { // When in manual mode
  id: null,
  round: null
};
let SCRAPE_LAST_MD5 = "";

export function setup(Models, app){
  // DEV ONLY!!
  GRAPHROLE.id = 1;

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
      // res.send("TODO - proxy sabbgraph");
      // TODO - also store any graph data in the db, as well as log the scrapes to filesystem

      const str = fs.readFileSync("./static/test/pres.xml", {encoding: "utf8"});
      const md5sum = md5(str);

      if (md5sum != SCRAPE_LAST_MD5){
        // SCRAPE_LAST_MD5 = md5sum;
        console.log("Got new data from sabbgraph");

        xsd.parseFile("./schema.xsd", function(err, schema){
          if (err){
            console.log("XSD load error:", err);
            return;
          }
          schema.validate(str, function(err, validationErrors){
            if (err){
              console.log("XML error:", err);
              return;
            }

            if (validationErrors){
              console.log("XML Validation errors:", validationErrors)
              return;
            }

            parseString(str, (err, xml) => {
              // process and cache
              if (err) {
                console.log("XML Parse Error:", err);
                return;
              }

              console.log(xml)
              const position = xml.root.position;
              const sabbGraphId = position[0].$.id;

              // fs.writeFile("scrapes/" + sabbGraphId + "-" + Date.now() + ".xml", str);

              // TODO - disjoint graph candidates from people elsewhere in the system.
              //        - allows for name differences and things



            });
          });  
        });
      }

      

      // console.log(str)
      res.set('Content-Type', 'text/plain');
      res.send(str);

      // TODO - add a scrape now feature, in case graph dies, we can still manually trigger a scrape
    }
  });
}

export function bind(Models, socket){
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
  const { Person, Position, Election, ElectionRound } = Models;

  return Election.find({
    where:{
      positionId: pid
    },
    include: [ Position ]
  }).then(election => {
    if (!election)
      return "BAD POSITION";

    const rootElm = builder.create('root');
    rootElm.ele('position', { id: election.Position.miniName }, election.Position.fullName);
    const candidates = rootElm.ele('candidates');
    const rounds = rootElm.ele('rounds');

    const rawCandidates = JSON.parse(election.candidates);
    Object.keys(rawCandidates).forEach(id => {
      const cand = rawCandidates[id];
      candidates.ele('candidate', { id: id }, cand);
      // TODO - figure out how to order (split cand into { name, order} ??)
    });

    const where = {};
    if (maxRound >= 0 && maxRound != null)
      where.round = { $lte: maxRound };

    return election.getElectionRounds({
      where,
      order: [[ "round", "ASC" ]]
    }).then(data => {
      data.forEach(r => {
        const elm = rounds.ele('round', { number: r.round });
        const results = JSON.parse(r.results);

        Object.keys(results).forEach(id => {
          const count = results[id];
          const elim = count == "elim"

          const props = { candidate: id };
          if (elim)
            props.eliminated = true;

          elm.ele('result', props, elim ? undefined : count);
        });
      });

      return rootElm.end({ pretty: true});
    });
  }).catch(e => {
    console.log("ERR:", e);
    return "UNKNOWN ERROR";
  });
}
