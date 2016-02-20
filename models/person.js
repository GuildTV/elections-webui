import thinky from '../thinky';

const r = thinky.r;
const type = thinky.type;

let Person = thinky.createModel('People', {
  id: type.string(),
  uid: type.string(),
  profile: type.string(),
  type: type.string().enum([
    "talent",
    "candidate",
    "officer"
  ]),
  firstName: type.string(),
  lastName: type.string(),
  positionId: type.string(),
  candidate: type.boolean(),
  elected: type.boolean(),
  manifestoPoints: {
    one: type.string(),
    two: type.string(),
    three: type.string()
  }
});

export default Person
