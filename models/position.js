import thinky from '../thinky';

const type = thinky.type;

let Position = thinky.createModel('Positions', {
  id: type.string(),
  type: type.string().enum([
    "candidateSabb",
    "candidateNonSabb",
    "other"
  ]),
  fullName: type.string(),
  compactName: type.string(),
  miniName: type.string(),
  sidebarUseOfficer: type.boolean(),
  order: type.number().integer().min(0)
});

export default Position
