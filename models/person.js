import thinky from '../thinky';

const r = thinky.r;
const type = thinky.type;

let Person = thinky.createModel('People', {
  id: type.string(),
  uid: type.string(),
  photo: type.string(), // base64 encoded png
  positionId: type.string(),
  firstName: type.string(),
  lastName: type.string(),
  elected: type.boolean(),
  manifestoPoints: {
    one: type.string(),
    two: type.string(),
    three: type.string()
  },
  order: type.number().integer().min(0)
});

export default Person
