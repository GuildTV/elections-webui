import thinky from '../thinky';

const r = thinky.r;
const type = thinky.type;

export default let Election = thinky.createModel('election', {
  id: type.string(),
  name: type.string(),
  candidates: type.string(),
  rounds: type.string()
});
