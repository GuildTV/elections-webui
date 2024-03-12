import { Sequelize } from 'sequelize-typescript'
import Module from 'node:module'

import { Election, ElectionRound } from './Elections.js'
import { Person, Position } from './People.js'
import { TickerEntry } from './Ticker.js'

const require = Module.createRequire(import.meta.url)

const env = process.env.NODE_ENV || 'development'
const config = require('../../sequelize.json')[env]

if (env != 'development' && env != 'test') {
	console.log('Disabling sequelize logger')
	config.logging = false
}

const sequelize = new Sequelize(config.database, config.username, config.password, config)
sequelize.addModels([Election, ElectionRound, TickerEntry, Person, Position])

export { sequelize }
