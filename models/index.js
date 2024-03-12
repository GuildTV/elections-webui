import Sequelize from "sequelize";
import Module from "node:module";

import ElectionModel from "./Election.js";
import ElectionRoundModel from "./ElectionRound.js";
import PersonModel from "./Person.js";
import PositionModel from "./Position.js";
import TickerEntryModel from "./TickerEntry.js";

const require = Module.createRequire(import.meta.url);

const env = process.env.NODE_ENV || "development";
const config = require("../sequelize.json")[env];

if (env != "development" && env != "test") {
  console.log("Disabling sequelize logger");
  config.logging = false;
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
const db = {};

const models = [
  ElectionModel,
  ElectionRoundModel,
  PersonModel,
  PositionModel,
  TickerEntryModel,
];

for (const model of models) {
  const modelInstance = model(sequelize, Sequelize);
  db[modelInstance.name] = modelInstance;
}

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
