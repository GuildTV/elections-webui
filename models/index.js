import Person from './person';
import Position from './position';
import Vote from './votes';
import RoundElimination from './elimination';

Person.hasOne(Position, "position", "positionId", "id");

Vote.belongsTo(Person, "person", "personId", "id")

Person.hasMany(Vote, "votes", "id", "personId");
Position.hasMany(Vote, "votes", "id", "positionId");

Position.hasMany(RoundElimination, "eliminations", "id", "positionId");
Person.hasMany(RoundElimination, "eliminations", "id", "personId");

export default {
  Person,
  Position,
  Vote,
  RoundElimination
}