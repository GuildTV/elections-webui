import thinky from '../thinky';

const type = thinky.type;

let RoundElimination = thinky.createModel('eliminations', {
  id: type.string(),
  round: type.number().integer().min(0),
  positionId: type.string(),
  personId: type.string()
});

export default RoundElimination;