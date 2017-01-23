import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require('../sequelize.json')[env];

if(env != 'development' && env != 'test'){
  console.log("Disabling sequelize logger");
  config.logging = false;
}

const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;