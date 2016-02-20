import Person from './person';
import Position from './position';
// import Elections from './elections';
// import Rounds from './rounds';
// import Votes from './votes';
//
// Election.hasMany(Round, "rounds", "id", "electionId");
// Rounds.belongsTo(Election, "election", "electionId", "id")
// Rounds.hasMany(Vote, "votes", "id", "voteId");

Position.belongsTo(Person, "position", "id", "positionId");

export default {
  Person,
  Position
}