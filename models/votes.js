import thinky from '../thinky';

const type = thinky.type;

let Vote = thinky.createModel('vote', {
  id: type.string(),
  positionId: type.string(),
  personId: type.string(),
  round: type.number().integer().min(0),
  votes: type.number().integer().min(0)
});

export default Vote;