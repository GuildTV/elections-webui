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
  title: type.string().enum([
    "Host",
    "Roving Reporter",
    "Political Commentator",
    "Activities & Development Officer",
    "Anti-Racism, Anti Fascism Officer",
    "Community Action Officer",
    "Disabled Students' Officer",
    "Ethical & Environmental Officer",
    "Ethnic Minority Students’ Officer",
    "Education Officer",
    "Housing & Community Officer",
    "Home Students' Officer",
    "International Students' Officer",
    "Lesbian, Gay, Bisexual, Trans and Queer Students' Officer",
    "President",
    "Representation & Resources Officer",
    "Sports Officer",
    "Satellite Sites Officer",
    "Welfare Officer",
    "Womens's Officer"
  ]),
  candidate: type.boolean(),
  elected: type.boolean(),
  manifestoPoints: {
    one: type.string(),
    two: type.string(),
    three: type.string()
  }
});

export default Person
