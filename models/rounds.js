import thinky from '../thinky';

import Election from 'elections'
import Vote from 'votes'

const r = thinky.r;
const type = thinky.type;

export default let Round = thinky.createModel('round', {
  id: type.string(),
  roundId: type.string(),
  electionId: type.string(),
  votes: type.string()
});

Rounds.belongsTo(Election, "election", "electionId", "id")
Rounds.hasMany(Vote, "votes", "id", "voteId");
