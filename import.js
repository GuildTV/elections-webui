import mapSeries from 'promise-map-series';

import Models from './models';

import positions from './dumps/positions';
import people from './dumps/people';
import eliminations from './dumps/eliminations';
import votes from './dumps/votes';

const positionMap = {};
const personMap = {};

const voteMap = {};
const eliminationMap = {};

function migratePositions(){
  return mapSeries(positions, (pos) => {
    console.log("Migrating position", pos.fullName);

    const oldId = pos.id;

    pos.id = undefined;
    pos.winnerOrder = pos.order;

    return Models.Position.create(pos).then((p) => {
      positionMap[oldId] = p.id;

      return true;
    });
  }).then(() => {
    console.log("\n\nPosition Map:", positionMap, "\n\n");

    return true;
  });
}
function migratePeople(){
  return mapSeries(people, (per) => {
    console.log("Migrating person", per.uid);
    console.log("Pos id:", per.positionId, "=>", positionMap[per.positionId]);

    const manifesto = per.manifesto || {};

    return Models.Person.create({
      uid: per.uid,
      positionId: positionMap[per.positionId],
      firstName: per.firstName,
      lastName: per.lastName,
      photo: per.photo || "",
      manifestoOne: manifesto.one,
      manifestoTwo: manifesto.two,
      manifestoThree: manifesto.three,
      order: per.order,
      elected: !!per.elected
    }).then((p) => {
      personMap[per.id] = per.firstName + " " + per.lastName;

      return true;
    });
  }).then(() => {
    console.log("\n\nPerson Map:", personMap, "\n\n");

    return true;
  });
}

function compileEliminationMap(){
  for(var elim of eliminations){
    const posId = elim.positionId;
    const perId = elim.personId;
    const round = elim.round;

    if (!eliminationMap[posId])
      eliminationMap[posId] = [];

    eliminationMap[posId][round] = perId;
  }

  console.log("\n\nEliminations:", eliminationMap, "\n\n");
}

function compileVotesMap(){
  for(var vote of votes){
    const posId = vote.positionId;
    const perId = vote.personId;
    const round = vote.round;
    const count = vote.votes;

    if (!voteMap[posId])
      voteMap[posId] = [];

    if (!voteMap[posId][round])
      voteMap[posId][round] = {};

    voteMap[posId][round][perId] = count;
  }

  console.log("\n\nVotes:", voteMap, "\n\n");
}

function migrateElections(){
  return mapSeries(Object.keys(voteMap), (posId) => {
    const rounds = voteMap[posId] || [];
    const elims = eliminationMap[posId] || [];
    const newPosId = positionMap[posId];

    console.log("Migrating votes for position", posId, "=>", newPosId);
    console.log(rounds.length, "rounds");
    console.log(elims.length, "elimintions");

    const peopleIds = [];
    rounds.forEach((v, i) => {
      const keys = Object.keys(v);
      peopleIds.push(...keys);
    });

    const people = {};
    peopleIds.forEach(v => {
      if (v.indexOf("ron") === 0)
        people[v] = "RON";
      else
        people[v] = personMap[v] || "???";
    });

    console.log("people", people)
    console.log("results", rounds)

    return Models.Election.create({
      positionId: newPosId,
      candidates: JSON.stringify(people)
    }).then(election => {
      return mapSeries(rounds, (votes, num) => {
        if (!votes)
          return true;

        for (var i=0; i<num; i++){
          votes[elims[i]] = "elim";
        }

        return Models.ElectionRound.create({
          electionId: election.id,
          round: num,
          results: JSON.stringify(votes)
        });
      });
    });
  })
}


migratePositions()
  .then(migratePeople)
  .then(compileEliminationMap)
  .then(compileVotesMap)
  .then(migrateElections)
  .catch(e => console.error(e))
