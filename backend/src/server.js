'use strict'
import express from 'express'
import bodyParser from 'body-parser'
import { Server as SocketIoServer } from 'socket.io'

import { webui_port } from './config.js'

import * as Models from './models/sequelize.js'

import { setup as positionSetup } from './controllers/position.js'
import { setup as peopleSetup } from './controllers/person.js'
import { bind as cvizBind, setup as cvizSetup } from './controllers/cviz.js'
import { setup as graphSetup } from './controllers/graphs.js'
import { setup as tickerSetup } from './controllers/ticker.js'

const app = express()

// Run server to listen on port 3000.
const server = app.listen(webui_port, '0.0.0.0', () => {
	console.log(`listening on *:${webui_port}`)
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(express.static('webui/dist'))

const io = new SocketIoServer(server)

graphSetup(app)
positionSetup(app)
peopleSetup(app, io)
cvizSetup(Models, app)
tickerSetup(app)

io.on('connection', function (client) {
	console.log('New connection from ' + client.handshake.address + ':' + client.handshake.port)

	cvizBind(Models, client, io)

	client.on('disconnect', function () {
		console.log('Lost client')
	})
})
